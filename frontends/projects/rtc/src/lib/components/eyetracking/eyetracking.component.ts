import { Component, Input, OnInit } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';
import { ChannelType, DeviceType, EyeTrackingData, EyeTrackingRxChannel } from '@sstepkiz';

import { RtcService } from '../../services/rtc.service';

@Component({
  selector: 'lib-rtc-eyetracking',
  styleUrls: ['./eyetracking.component.scss'],
  templateUrl: './eyetracking.component.html'
})
export class EyetrackingComponent implements OnInit {

  /**
   * Number of currently active peer connections.
   */
  private activeCalls = 0;

  /**
   * Identity of selected user.
   */
  @Input()
  userId: string;

  channel?: EyeTrackingRxChannel;

  /**
   * Test EyeTrackingData
   * @Todo add EyeTrackingData Stream
   */
  eyeData: EyeTrackingData = { c: 0.5, x: 30, y: 40, t: 0 };

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
   * Reference to partners video element.
   */
  @ViewChild('video')
  video: ElementRef;

  /**
   * Gets the HTML element of the video.
   */
  get videoElement(): HTMLVideoElement {
    return this.video?.nativeElement;
  }

  /**
   * Constructs a new component to test RTC functionalities.
   * @param rtcService RTC service instance.
   */
  constructor(
    public readonly rtcService: RtcService,
  ) { }

  /**
   * Hangs up the call.
   */
  hangup(): void {
    this.partner.socketId = '';
    this.partner.userId = '';
    this.channel?.close();
  }

  /**
   * Initializes the component.
   */
  async ngOnInit(): Promise<void> {

    // This needs to be done for each component which needs to access peer instances to a specific user.
    this.rtcService.getPeer(this.userId).subscribe(async peer => {
      console.log('etk running', peer);
      // Update number of active calls to update isCallActive property for UI.
      this.activeCalls++;

      try {
        console.log('requesting channels', peer, ChannelType.eyetracking);
        // Request to open an eye tracking channel.
        const channels = await peer.requestChannels(this.rtcService.signallingChannel, ChannelType.eyetracking);
        console.log('channels', channels);
        // Cast opened channel to eye tracking rx channel.
        this.channel = channels[0] as EyeTrackingRxChannel;
        console.log('channel', this.channel);
        // Subscribe events.
        const onData = (data: EyeTrackingData) => {
          // Apply new eye gaze data.
          this.eyeData = data;
        };
        const onClose = () => {
          console.log('============ etk closed');
          // Eye Tracking Channel is closed now.
          this.activeCalls--;
          this.channel.removeListener('closed', onClose);
          this.channel.removeListener('message', onData);
          this.videoElement.srcObject = undefined;
        };
        this.channel.addListener('closed', onClose);
        this.channel.addListener('message', onData);
        // Apply video stream.
        const stream = new MediaStream([this.channel.track]);
        this.videoElement.srcObject = stream;
      } catch (error) {
        console.error('Failed to get channels', error);
      }
    });
  }
}
