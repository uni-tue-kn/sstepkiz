import { Component, Input, OnInit } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';
import { ChannelType, DeviceType, Handset, Peer, RxChannel, TxChannel, EyeTrackingRxChannel } from '@sstepkiz';
import { AuthService } from 'projects/auth/src/public-api';
import { RtcService } from '../../services/rtc.service';

@Component({
  selector: 'lib-rtc-user-ui',
  templateUrl: './user-ui.component.html',
  styleUrls: ['./user-ui.component.scss']
})
export class UserUiComponent implements OnInit {

  /**
   * Handset to accept or decline the call.
   */
  handset: Handset | null = null;

  /**
   * Gets, if call is active.
   */
  get isCallActive(): boolean {
    return !!this.peer;
  }

  /**
   * Gets, if incoming call is not yet accepted or declined.
   */
  get isRinging(): boolean {
    return this.handset !== null;
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
   * Username of the partner.
   */
  readonly partner = { socketId: '', userId: '' };


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

  /**
   * Gets sender. It can only get his on sender
   */
  get sender(): { socketId: string, userId: string } {
    // Cancel if no senders exist.
    if (!this.rtcService.senders || Object.getOwnPropertyNames(this.rtcService.senders).length < 1) { return null; }
    // Extract socketId-userId pairs from senders. Patients can get only der own userId
    // const userId = Object.getOwnPropertyNames(this.rtcService.senders)[0];
    const socketId = this.rtcService.senders[this.username].slice(-1).toString();
    return { socketId, userId: this.username };
  }


  /**
   * Identity of active session.
   */
  sessionId = '';

  /**
   * Maps the shorthand for the full name.
   */
  sensorNames = { ecg: 'ECG', eda: 'EDA', etk: 'EyeTracking', mov: 'Bewegungssensoren' };

  /**
   * Gets the active sender channels.
   */
  get txChannels(): TxChannel[] {
    return this.peer?.getTxChannels() ?? [];
  }

  /**
   * Gets the selected channel type.
   */
  type: ChannelType = ChannelType.monitoring;

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
   * Wait for the therapist to conact.
   */
  wait = false;

  /**
   * Constructs a new component to test RTC functionalities.
   * @param authService Auth service instance.
   * @param rtcService RTC service instance.
   */
  constructor(
    private readonly authService: AuthService,
    public readonly rtcService: RtcService
  ) { }

  /**
   * Accepts a received call with own video.
   */
  async accept(): Promise<void> {
    // Store session and partner name.
    this.sessionId = this.handset.offer.sessionId;
    this.partner.socketId = this.handset.offer.socketId;
    this.partner.userId = this.handset.offer.userId;

    // Accept the call and wait for connection.
    this.peer = await this.handset.accept();
    this.peer.addListener('closed', () => {
      this.peer = undefined;
    });

    // Handset no more needed.
    this.handset = null;
  }

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
      this.peer.addListener('closed', () => {
        this.peer = undefined;
      });
      // Await opened channels.
      this.peer.addListener('channelOpened', (channel: RxChannel) => {
        const msgs = [];
        this.messages[channel.type.toString()] = msgs;
        channel.addListener('message', (data: string) => msgs.push(data));
      });
      // open the monitor
      this.open();
    } catch (error) {
      console.error(error);
      this.hangup();
    }
  }
  /**
   * Closes all monitor channels.
   */
  closeMonitor(): void{
    this.rxChannels.forEach(channel => {
      if (channel.type.toString() === 'mov'){
        channel.close();
      }
    });
  }

  /**
   * Declines the call.
   */
  decline(): void {
    this.handset.decline();
    this.handset = null;
    this.sessionId = '';
    this.partner.socketId = '';
    this.partner.userId = '';
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
   * Initializes the component.
   */
  async ngOnInit(): Promise<void> {
    this.rtcService.ring.subscribe((handset: Handset) => this.onRing(handset));
  }

  /**
   * Handles received call.
   * @param handset Handset to handle call.
   */
  private onRing(handset: Handset): void {
    this.handset = handset;
    this.sessionId = this.handset.offer.sessionId;
    this.partner.socketId = this.handset.offer.socketId;
    this.partner.userId = this.handset.offer.userId;
  }

  /**
   * Requests to open the selected channel.
   */
  open(): void {
    if (!this.peer || !this.rtcService.signallingChannel) { throw new Error('undefined!'); }
    this.peer.requestChannels(this.rtcService.signallingChannel, this.type);
  }
}
