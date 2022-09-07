import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { EcgData, EcgRxChannel, DeviceType, ChannelType, Peer } from '@sstepkiz';
import { SmoothieChart, TimeSeries } from 'smoothie';
import { AuthService } from 'projects/auth/src/public-api';
import { RtcService } from '../../services/rtc.service';

@Component({
  selector: 'lib-rtc-body-functions-ecg',
  templateUrl: './body-functions-ecg.component.html',
  styleUrls: ['./body-functions-ecg.component.scss']
})
export class BodyFunctionsEcgComponent implements OnInit {
  /**
   * Number of currently active peer connections.
   */
  private activeCalls: number = 0;

  /**
   * Identity of selected user.
   */
  @Input() userId: string;

  baselineState: 'stopped' | 'running' | 'finished' = 'stopped';

  hrAvg: number = 0;
  hrCount: number = 0;
  
  meanHrAvg: number = 0;
  meanHrCount: number = 0;

  sdnnAvg: number = 0;
  sdnnCount: number = 0;

  rmssdAvg: number = 0;
  rmssdCount: number = 0;

  baselineStart(): void {
    this.hrAvg = 0;
    this.hrCount = 0;
    this.meanHrAvg = 0;
    this.meanHrCount = 0;
    this.sdnnAvg = 0;
    this.sdnnCount = 0;
    this.rmssdAvg = 0;
    this.rmssdCount = 0;
    this.baselineState = 'running';
  }
  baselineStop(): void {
    this.baselineState = 'finished';
  }
  baselineReset(): void {
    this.hrAvg = 0;
    this.hrCount = 0;
    this.meanHrAvg = 0;
    this.meanHrCount = 0;
    this.sdnnAvg = 0;
    this.sdnnCount = 0;
    this.rmssdAvg = 0;
    this.rmssdCount = 0;
    this.baselineState = 'stopped';
  }

  // The currently measured values
  heartRateData: EcgData = { t: 0, heartRate: 0, rrInterval: 0, meanHr: 0, sampleSize: 0, consistent: false, sdnn: 0, rmssd: 0, nn50: 0, pnn50: 0, vlf: 0, lf: 0, hf: 0, lfHfRatio: 0 };

  // Chart displaying the patient's heartRate
  @ViewChild('chartHr', { static: true }) chartHrRef: ElementRef<HTMLCanvasElement>;
  chartHr: SmoothieChart;

  // Chart displaying the patient's heartRate
  @ViewChild('chartHrv', { static: true }) chartHrvRef: ElementRef<HTMLCanvasElement>;
  chartHrv: SmoothieChart;

  // Time series displayed in the hr chart
  seriesHr: TimeSeries;
  seriesMeanHr: TimeSeries;
  // Time series displayed in the hrv chart
  seriesRmssd: TimeSeries;
  seriesSdnn: TimeSeries;

  baselineSeriesHr: TimeSeries;
  baselineSeriesMeanHr: TimeSeries;
  baselineSeriesRmssd: TimeSeries;
  baselineSeriesSdnn: TimeSeries;

  vlf?: number = undefined;
  lf?: number = undefined;
  hf?: number = undefined;

  /**
   * Gets, if call is active.
   */
  get isCallActive(): boolean {
    return this.activeCalls > 0;
  }

  /**
   * Declares device type enum for template.
   */
  modes = DeviceType;

  /**
   * Username of the partner.
   */
  readonly partner = { socketId: '', userId: '' };

  /**
   * Gets the selected channel type.
   */
  type: ChannelType = ChannelType.ecg;

  /**
   * Gets the username of the current user.
   */
  get username(): string {
    if (this.authService.isAuthenticated) {
      return this.authService.claims.preferred_username;
    } else {
      return '[not authenticated]';
    }
  }

  private onData = (ecgData: EcgData) => {
    // Set ecgData
    this.heartRateData = ecgData;
    // Get the time at which the data was measured
    var t = ecgData.t

    this.vlf = ecgData.vlf;
    this.lf = ecgData.lf;
    this.hf = ecgData.hf;

    if (ecgData.heartRate) {
      this.seriesHr.append(t, ecgData.heartRate);
    }
    if (ecgData.meanHr) {
      this.seriesMeanHr.append(t, ecgData.meanHr)
    }
    if (ecgData.rmssd) {
      this.seriesRmssd.append(t, ecgData.rmssd);
    }
    if (ecgData.sdnn) {
      this.seriesSdnn.append(t, ecgData.sdnn);
    }

    if (this.baselineState === 'running') {
      this.hrAvg = ((this.hrAvg * this.hrCount) + ecgData.heartRate) / ++this.hrCount;
      this.meanHrAvg = ((this.meanHrAvg * this.meanHrCount) + ecgData.meanHr) / ++this.meanHrCount;
      this.sdnnAvg = ((this.sdnnAvg * this.sdnnCount) + ecgData.sdnn) / ++this.sdnnCount;
      this.rmssdAvg = ((this.rmssdAvg * this.rmssdCount) + ecgData.rmssd) / ++this.rmssdCount;
    } else if (this.baselineState === 'finished') {
      this.baselineSeriesHr.append(t, this.hrAvg);
      this.baselineSeriesMeanHr.append(t, this.meanHrAvg);
      this.baselineSeriesRmssd.append(t, this.rmssdAvg);
      this.baselineSeriesSdnn.append(t, this.sdnnAvg);
    }

    // Change the hrv charts background (green/red) to indicate if the datasets consistency
    this.chartHrv.options.grid.fillStyle = (ecgData.consistent ? '#f0f0f0' : '#ffc0c0');
  };

  /**
   * Constructs a new component to test RTC functionalities.
   * @param authService Auth service instance.
   * @param rtcService RTC service instance.
   */
  constructor(
    private readonly authService: AuthService,
    public readonly rtcService: RtcService,
  ) { }

  /**
   * Hangs up the call.
   */
  hangup(): void {
    this.partner.socketId = '';
    this.partner.userId = '';
    this.resetCharts();
  }

  /**
   * Initializes the component.
   */
  async ngOnInit(): Promise<void> {
    // This needs to be done for each component which needs to access peer instances to a specific user.
    this.rtcService.getPeer(this.userId).subscribe(async peer => {
      // Update number of active calls to update isCallActive property for UI.
      this.activeCalls++;

      // Request to open an eye tracking channel.
      const channels = await peer.requestChannels(this.rtcService.signallingChannel, ChannelType.ecg);
      // Cast opened channel to eye tracking rx channel.
      const ch = channels[0] as EcgRxChannel;
      // Subscribe events.
      const onClose = () => {
        // Eye Tracking Channel is closed now.
        this.activeCalls--;
        ch.removeListener('closed', onClose);
        ch.removeListener('message', this.onData);
      };
      ch.addListener('closed', onClose);
      ch.addListener('message', this.onData);
    });

    // Init charts for EcgValues.
    this.initCharts();
  }

  /**
   * Requests to open the selected channel.
   */
  open(peer: Peer): void {
    if (!peer || !this.rtcService.signallingChannel) {
      throw new Error('undefined!');
    }
    peer.requestChannels(this.rtcService.signallingChannel, this.type);
  }

  private initCharts(): void {
    this.initHeartRateChart();
    this.initHrvChart();
  }

  /*
   * Initializes the heart rate chart
   */
  private initHeartRateChart(): void {
    this.baselineSeriesHr = new TimeSeries();
    this.baselineSeriesMeanHr = new TimeSeries();
    this.seriesHr = new TimeSeries();
    this.seriesMeanHr = new TimeSeries();
    const canvas = this.chartHrRef.nativeElement;
    this.chartHr = new SmoothieChart({
      minValue: 50,
      maxValue: 180,
      interpolation: 'step',
      grid: {
        fillStyle: '#f0f0f0',
        strokeStyle: 'rgba(119,119,119,0.30)',
        borderVisible: true,
        verticalSections: 7
      },
      labels: {
        fillStyle: '#000000',
        fontSize: 17,
        disabled: false
      },
      tooltip: true,
      millisPerPixel: 40
    });
    this.chartHr.addTimeSeries(this.baselineSeriesHr, { lineWidth: 2, strokeStyle: '#000055' });
    this.chartHr.addTimeSeries(this.baselineSeriesMeanHr, { lineWidth: 2, strokeStyle: '#005500' });
    this.chartHr.addTimeSeries(this.seriesHr, { lineWidth: 1, strokeStyle: '#0000ff', fillStyle: 'rgba(161,161,255,0.30)' });
    this.chartHr.addTimeSeries(this.seriesMeanHr, { lineWidth: 1, strokeStyle: '#00ff00', fillStyle: 'rgba(161,255,161,0.30)' });
    this.chartHr.streamTo(canvas);
  }

  /*
   * Initializes the ecg chart
   */
  private initHrvChart(): void {
    this.baselineSeriesRmssd = new TimeSeries();
    this.baselineSeriesSdnn = new TimeSeries();
    this.seriesSdnn = new TimeSeries();
    this.seriesRmssd = new TimeSeries();
    const canvas = this.chartHrvRef.nativeElement;
    this.chartHrv = new SmoothieChart({
      interpolation: 'step',
      grid: {
        fillStyle: '#ffc0c0',
        strokeStyle: 'rgba(119,119,119,0.30)',
        borderVisible: true,
        verticalSections: 7
      },
      labels: {
        fillStyle: '#000000',
        fontSize: 17,
        disabled: false
      },
      tooltip: true,
      millisPerPixel: 40
    });
    this.chartHrv.addTimeSeries(this.baselineSeriesSdnn, { lineWidth: 2, strokeStyle: '#000055' });
    this.chartHrv.addTimeSeries(this.baselineSeriesRmssd, { lineWidth: 2, strokeStyle: '#005500' });
    this.chartHrv.addTimeSeries(this.seriesSdnn, { lineWidth: 1, strokeStyle: '#0000ff', fillStyle: 'rgba(161,161,255,0.30)' });
    this.chartHrv.addTimeSeries(this.seriesRmssd, { lineWidth: 1, strokeStyle: '#00ff00', fillStyle: 'rgba(161,255,161,0.30)' });
    this.chartHrv.streamTo(canvas);
  }

  /**
   * Resets and stops the charts and removes their values
   */
  private resetCharts(): void {
    this.seriesHr.clear();
    this.seriesMeanHr.clear();
    this.seriesRmssd.clear();
    this.seriesSdnn.clear();
    this.baselineSeriesHr.clear();
    this.baselineSeriesMeanHr.clear();
    this.baselineSeriesRmssd.clear();
    this.baselineSeriesSdnn.clear();
    this.chartHr.stop();
    this.chartHrv.stop();
    this.baselineReset();
  }
}
