import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChannelType, DeviceType, Peer, RxChannel, TxChannel, EyeTrackingRxChannel, MonitoringData, SensorData } from '@sstepkiz';
import { AuthService } from '../../../../../auth/src/public-api';
import { CsvFile } from '../../fs-api/csv-file.class';
import { FsFile } from '../../fs-api/fs-file.class';

import { RtcService } from '../../services/rtc.service';

interface MeasurementData {
  tTx: Date;
  tRx: Date;
  ch: string;
}

@Component({
  selector: 'lib-rtc-test',
  styleUrls: ['./test.component.scss'],
  templateUrl: './test.component.html'
})
export class TestComponent {

  /**
   * Gets, if call is active.
   */
  get isCallActive(): boolean {
    return !!this.peer;
  }

  /**
   * Received messages.
   */
  messages: { [type: string]: string[] } = {};

  /**
   * Declares device type enum for template.
   */
  modes = DeviceType;

  /**
   * Reference to own video element.
   */
  @ViewChild('myVideo')
  myVideo: ElementRef;

  etkActive: boolean = false;

  /**
   * Gets the HTML element of the partner video.
   */
  get myVideoElement(): HTMLVideoElement {
    return this.myVideo.nativeElement;
  }

  /**
   * Username of the partner.
   */
  readonly partner = { socketId: '', userId: '' };

  /**
   * Reference to partners video element.
   */
  @ViewChild('partnerVideo')
  partnerVideo: ElementRef;

  /**
   * Gets the HTML element of partner video.
   */
  get partnerVideoElement(): HTMLVideoElement {
    return this.partnerVideo.nativeElement;
  }

  /**
   * Peer connection.
   */
  peer?: Peer;

  /**
   * Gets the active receiver channels.
   */
  get rxChannels(): RxChannel[] {
    return this.peer?.getRxChannels() ?? [];
  }

  getLastMessage(channel: RxChannel): string {
    const type = channel.type.toString();
    const msgs = this.messages[type];
    if (!msgs) return '';
    const messages = [ ...msgs ];
    return messages[messages.length];
  }

  /**
   * Gets all senders.
   */
  get senders(): { socketId: string, userId: string }[] {
    // Cancel if no senders exist.
    if (!this.rtcService.senders) { return []; }
    // Extract all socketId-userId pairs from senders.
    const result: { socketId: string, userId: string }[] = [];
    const userIds = Object.getOwnPropertyNames(this.rtcService.senders);
    userIds.forEach(userId => {
      const items = this.rtcService.senders[userId].map(socketId => ({ socketId, userId }));
      result.push(...items);
    });
    return result;
  }

  /**
   * Identity of active session.
   */
  sessionId = '';

  /**
   * Gets the active sender channels.
   */
  get txChannels(): TxChannel[] {
    return this.peer?.getTxChannels() ?? [];
  }

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

  /**
   * Constructs a new component to test RTC functionalities.
   * @param authService Auth service instance.
   * @param rtcService RTC service instance.
   */
  constructor(
    private readonly authService: AuthService,
    public readonly rtcService: RtcService
  ) {}

  measureLatency: boolean = false;
  measureLatencyLocked: boolean = false;
  private readonly measurementBuffer: Array<MeasurementData> = [];

  /**
   * Calls a remote socket.
   * @param userId Identity of user to call.
   * @param socketId Identity of socket to call.
   * @param mode Mode of call.
   */
  async call(userId: string, socketId: string, mode: DeviceType.Monitor | DeviceType.Receiver): Promise<void> {
    // Start call.
    try {
      this.peer = await this.rtcService.call(userId, socketId, mode);
      this.partner.userId = userId;
      this.partner.socketId = this.peer.sessionId;
      this.peer.addListener('closed', () => {
        this.peer = undefined;
        this.myVideoElement.srcObject = undefined;
        this.partnerVideoElement.srcObject = undefined;
      });
      // Await opened channels.
      this.peer.addListener('channelOpened', (channel: RxChannel) => {
        switch (channel.type) {
          case ChannelType.eyetracking:
            break;
          default:
            const msgs = [];
            this.messages[channel.type.toString()] = msgs;
            channel.addListener('message', (data: MonitoringData | SensorData) => {
              msgs.push(data);
            });
            break;
        }
        // Start latency measuring
        if (this.measureLatency) {
          channel.addListener('message', (data) => {
            const t = new Date();
            const m: MeasurementData = {
              tTx: data.t,
              tRx: t,
              ch: channel.type.toString()
            };
            this.measurementBuffer.push(m);
          });
        }
      });
      let measurementFile: CsvFile = null;
      let measurementTimeout: number = null;
      this.measureLatencyLocked = true;
      const onClosed = () => {
        this.measureLatencyLocked = false;
        measurementFile?.close();
        measurementFile = null;
      }
      this.peer.addListener('closed', onClosed);
      this.peer.addListener('error', onClosed);
      const startWriting = async () => {
        try {
          if (!measurementFile) {
            console.log('Measurements ended');
            return;
          }
          while (this.measurementBuffer.length > 0) {
            const m = this.measurementBuffer.shift();
            await measurementFile.writeRow([m.tTx.toString(), m.tRx.getTime().toString(), m.ch]);
          }
        } catch (error) {
          console.error(`Failed write data`, error);
        }
        measurementTimeout = setTimeout(() => {
          startWriting();
        }, 100);
      };
      if (this.measureLatency) {
        measurementFile = await CsvFile.selectCsvFile(['t_tx', 't_rx', 'ch']);
        measurementFile.open({ keepExistingData: true });
        startWriting();
      }
    } catch (error) {
      this.measureLatencyLocked = false;
      console.error(error);
      this.myVideoElement.srcObject = undefined;
      this.partnerVideoElement.srcObject = undefined;
      this.hangup();
    }
  }


  close(channel: RxChannel): void {
    channel.close();
    switch (channel.type) {
      case ChannelType.eyetracking:
        this.etkActive = false;
        break;
    }
  }

  /**
   * Hangs up the call.
   */
  hangup(): void {
    if (this.peer) { this.rtcService.hangup(this.peer); }
    this.peer = undefined;
    this.sessionId = '';
    this.partner.socketId = '';
    this.partner.userId = '';
  }

  /**
   * Requests to open the selected channel.
   */
  open(): void {
    if (!this.peer || !this.rtcService.signallingChannel) { throw new Error('undefined!'); }
    switch (this.type) {
      case ChannelType.eyetracking:
        this.etkActive = true;
        break;
      default:
        this.peer.requestChannels(this.rtcService.signallingChannel, this.type);
        break;
    }
  }
}
