import { Injectable } from '@angular/core';
import { environment } from 'projects/aggregator-ui/src/environments/environment';
import { HrvFreqDomain, HrvTimeDomain } from '../../interfaces/ecg-data';
import { NnIntervalType } from '../../interfaces/nn-interval-type';
import { HrvFrequencyDomainService } from './hrv-frequency-domain.service';
import { HrvTimeDomainService } from './hrv-time-domain.service';


@Injectable({
  providedIn: 'root'
})
export class HrvService {

  // Tracked rrInvervals in the scanPeriod (in our case the nnIntervals)
  private nnIntervals: NnIntervalType[];

  // Current Average Heart Rate in the scanPeriod
  public meanHr: number;
  // Current SDNN of the rrIntervals in the scanPeriod
  public sdnn: number;
  // Current RMSSD of the rrIntervals in the scanPeriod
  public rmssd: number;
  // Current number of two successive rrIntervals with a difference over 50ms in the scanPeriod
  public nn50: number;
  // Percentage of two successive rrIntervals with a difference over 50ms in the scanPeriod
  public pnn50: number;

  // Very low frequency domain (0-0.04Hz)
  public vlf: number;
  // Low frequency domain (0.04-0.15Hz)
  public lf: number;
  // High frequency domain (0.15-0.4Hz)
  public hf: number;
  // Ratio of the lf and hf measurement
  public lfHfRatio: number;

  // Number of samples in the scanPeriod
  public sampleSize: number;
  // If the measurement has been active for over 'scanPeriod' ms
  public consistent: boolean;


  constructor(
    private freqDomainService: HrvFrequencyDomainService,
    private timeDomainService: HrvTimeDomainService
  ) {
    this.reset();
  }

  /**
   * Resets all hrv values
   */
  public reset() {
    this.nnIntervals = [];
    this.consistent = false;
    this.meanHr = 0;
    this.sdnn = NaN;
    this.rmssd = NaN;
    this.nn50 = 0;
    this.pnn50 = 0;
    this.vlf = NaN;
    this.lf = NaN;
    this.hf = NaN;
    this.lfHfRatio = NaN;
    this.sampleSize = 0;
    this.consistent = false;
  }

  /**
   * Adds an nnValue at the specified time and removes values that are older than the scanPeriod
   * @param nnValue       nnValue to add
   * @param nnTime        Time of the measurement
   */
  public addNNValue(nnValue: number, nnTime: number): void {
    var prevNnValue = nnValue;
    if (this.nnIntervals.length > 0) {
      prevNnValue = this.nnIntervals[this.nnIntervals.length - 1].value
    }
    this.nnIntervals.push({ value: nnValue, time: nnTime });
    this.timeDomainService.addValue(nnValue, nnTime, prevNnValue);

    const scanPeriod = this.convertMinToMs(environment.hrv.scanPeriodMins);

    // remove values that are older than 'scanPeriod'
    while (this.nnIntervals.length > 1 && (nnTime - this.nnIntervals[0].time) > scanPeriod) {
      var toRemove = this.nnIntervals.shift();
      var nextNnValue = toRemove.value;
      if (this.nnIntervals.length > 0) {
        prevNnValue = this.nnIntervals[0].value
      }

      this.timeDomainService.removeValue(toRemove.value, nextNnValue);

      if (!this.consistent) {
        this.printCurrentRRIntervalValues();
      }
      this.consistent = true;
    }
    this.updateValues();
  }

  /**
   * Adds an array of nnValues all at the same time
   * @param nnValues      nnValues to add
   * @param nnTime        Time of the measurement
   */
  public addNNValues(nnValues: number[], nnTime: number, accumulateTimes: boolean = true): void {
    let time = 0;
    nnValues.forEach(nnValue => {
      this.addNNValue(nnValue, time);
      if (accumulateTimes) {
        time += nnValue;
      }
    });
  }

  /**
   * Calculates and Updates all the hrv values
   */
  private updateValues(): void {
    if (this.nnIntervals.length > 1) {
      const timeDomain = this.getTimeDomainValues();
      const frequencyDomain = this.getFrequencyDomainValues();

      this.meanHr = timeDomain.meanHr;
      this.sdnn = timeDomain.sdnn;
      this.rmssd = timeDomain.rmssd;
      this.nn50 = timeDomain.nn50;
      this.pnn50 = timeDomain.pnn50;

      this.vlf = frequencyDomain.vlf;
      this.lf = frequencyDomain.lf;
      this.hf = frequencyDomain.hf;
      this.lfHfRatio = frequencyDomain.lfHfRatio;
      this.sampleSize = this.nnIntervals.length;
    }
  }

  /**
   * Gets the values of the hrv frequency domain using the current nnIntervals
   * @returns      Frequency domain value
   */
  getFrequencyDomainValues(): HrvFreqDomain {
    return this.freqDomainService.getFrequencyDomain(this.nnIntervals);
  }


  /**
   * Gets the values of the hrv time domain using the current nnIntervals
   * @returns        Time domain value
   */
  getTimeDomainValues(): HrvTimeDomain {
    const nnValues = this.extractNNValues();
    return this.timeDomainService.getTimeDomain(nnValues);
  }


  /**
   * Helper function to separate nnValues from nnIntervals
   * @returns      List of nnValues
   */
  private extractNNValues() {
    return this.nnIntervals.map((e) => {
      return e.value;
    });
  }

  /**
   * Converts the mins to ms
   * @param min      minutes
   * @returns        minutes as ms
   */
  private convertMinToMs(min: number): number {
    const msPerMin = 60000;
    return Math.round(min * msPerMin);
  }

  /**
   * Prints the nnInterval values currently stored in nnInterval as an array (e.g. [x, y, ..., z])
   */
  public printCurrentRRIntervalValues(): void {
    let res = this.nnIntervals.reduce((acc, curr) => acc + curr.value + ', ', '[');
    // cut the last ','
    res = res.substring(0, res.length - 2);
    res += ']';
    console.log(res);
    console.log(this.sdnn, ' - ', this.rmssd, ' - ', this.hf, ' - ', this.lf, ' - ', this.lfHfRatio);
  }
}
