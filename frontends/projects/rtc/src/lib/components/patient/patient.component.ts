import { Component, OnInit } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';
import { ChannelType, DeviceType, Handset, Peer, RxChannel, TxChannel, EyeTrackingRxChannel } from '@sstepkiz';
import { AuthService } from 'projects/auth/src/public-api';
import { RtcService } from 'projects/rtc/src/public-api';
@Component({
  selector: 'lib-rtc-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {

  sensors = [
  {name: 'ECG', activ: false},
  {name: 'EDA', activ: false},
  {name: 'EyeTracking', activ: true},
  {name: 'Bewegungssensoren', activ: false}
  ];
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
   * Reference to own video element.
   */
  @ViewChild('myVideo')
  myVideo: ElementRef;

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

    // Set local stream to myVideo element.
    // let localStream: MediaStream | undefined;
    // try {
    //   localStream = await this.rtcService.getUserMedia({ video: true });
    // } catch (error) {
    //   console.error(error);
    //   localStream = undefined;
    // }
    // if (localStream) { this.myVideoElement.srcObject = localStream; }

    // Accept the call and wait for connection.
    this.peer = await this.handset.accept();
    this.peer.addListener('closed', () => {
      this.peer = undefined;
      this.myVideoElement.srcObject = undefined;
      this.partnerVideoElement.srcObject = undefined;
      // if (localStream) { localStream.getTracks().forEach(t => t.stop()); }
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
    // Set local stream to myVideo element.
    // let stream: MediaStream | undefined;
    // try {
    //   stream = await this.rtcService.getUserMedia({ video: true });
    // } catch (error) {
    //   console.error(error);
    //   stream = undefined;
    // }
    // this.myVideoElement.srcObject = stream;

    // Start call.
    try {
      this.peer = await this.rtcService.call(userId, socketId, mode);
      this.peer.addListener('closed', () => {
        this.peer = undefined;
        this.myVideoElement.srcObject = undefined;
        this.partnerVideoElement.srcObject = undefined;
        // if (stream) { stream.getTracks().forEach(t => t.stop()); }
      });
      // Await opened channels.
      this.peer.addListener('channelOpened', (channel: RxChannel) => {
        const msgs = [];
        this.messages[channel.type.toString()] = msgs;
        channel.addListener('message', (data: string) => msgs.push(data));
        if (channel.type === ChannelType.eyetracking) {
          const ch = channel as EyeTrackingRxChannel;
          this.partnerVideoElement.srcObject = new MediaStream([ch.track]);
          const onClose = () => {
            channel.removeListener('closed', onClose);
            this.partnerVideoElement.srcObject = null;
          };
          channel.addListener('closed', onClose);
        }
      });
      // open the
      this.open();
    } catch (error) {
      console.error(error);
      this.myVideoElement.srcObject = undefined;
      this.partnerVideoElement.srcObject = undefined;
      // if (stream) { stream.getTracks().forEach(t => t.stop()); }
      this.hangup();
    }
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


