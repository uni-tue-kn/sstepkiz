import { EventEmitter } from "../common";
import { CandidateOffer, ChannelRequest, DescriptionOffer, HangupReason, RtcConfig, SignallingChannel } from "../signalling";
import { ChannelRequestEvent } from "./channel-request-event.interface";
import { ChannelType } from "./channel-type.enum";
import { EcgRxChannel } from "../sensors/ecg/ecg-rx-channel.class";
import { EcgTxChannel } from "../sensors/ecg/ecg-tx-channel.class";
import { EdaRxChannel } from "../sensors/eda/eda-rx-channel.class";
import { EdaTxChannel } from "../sensors/eda/eda-tx-channel.class";
import { EyeTrackingRxChannel } from "../sensors/eyetracking/eyetracking-rx-channel.class";
import { EyeTrackingTxChannel } from "../sensors/eyetracking/eyetracking-tx-channel.class";
import { MonitoringRxChannel } from "../sensors/monitoring/monitoring-rx-channel.class";
import { MonitoringTxChannel } from "../sensors/monitoring/monitoring-tx-channel.class";
import { MovementRxChannel } from "../sensors/movement/movement-rx-channel.class";
import { MovementTxChannel } from "../sensors/movement/movement-tx-channel.class";
import { PeerEvent } from "./peer-event.type";
import { PeerState } from "./peer-state.enum";
import { RxChannel } from "./rx-channel.class";
import { TxChannel } from "./tx-channel.class";
import { IceCredential } from "./ice-credential.interface";

// Polyfill to use Browser's native RTCPeerConnection implementation or wrtc package for Node.js:
const _RTCPeerConnection = typeof window !== 'undefined' ? RTCPeerConnection : eval('require(\'wrtc\').RTCPeerConnection');

export class Peer {

  /**
   * Listener that handles received ICE candidates or undefined if not subscribed.
   */
  private candidateListener?: (candidate: CandidateOffer) => void = undefined;

  /**
   * Listener that handles received channel requests or undefined if not subscribed.
   */
  private channelListener?: (request: ChannelRequest) => void = undefined;

  /**
   * Listener that handles received session description or undefined if not subscribed.
   */
  private descriptionListener?: (description: DescriptionOffer) => void = undefined;

  /**
   * Event emitter for internal events.
   */
  private readonly eventEmitter: EventEmitter = new EventEmitter();

  private _rxChannels: RxChannel[] = [];
  /**
   * Gets active receiver channels.
   */
  getRxChannels(): RxChannel[] {
    return this._rxChannels;
  }

  private _txChannels: TxChannel[] = [];
  /**
   * Gets active sender channels.
   */
  getTxChannels(): TxChannel[] {
    return this._txChannels;
  }

  private _hangupReason?: HangupReason = undefined;
  /**
   * Gets the reason for hangup or undefined if no hangup.
   */
  public get hangupReason(): HangupReason | undefined {
    return this._hangupReason;
  }

  /**
   * Listener that handles local ICE candidate or undefined if not subscribed.
   */
  private localCandidateListener?: (event: RTCPeerConnectionIceEvent) => void = undefined;

  /**
   * Listener that handles needed renegotiation.
   */
  private negotiationListener?: () => void = undefined;

  /**
   * The WebRTC connection to the remote peer.
   */
  private readonly peerConnection: RTCPeerConnection;

  private _remoteSocketId?: string = undefined;
  /**
   * Gets the identity of the remote user.
   */
  get remoteSocketId(): string | undefined {
    return this._remoteSocketId;
  }

  private _sessionId?: string = undefined;
  /**
   * Gets the identity of the current session.
   */
  get sessionId(): string | undefined {
    return this._sessionId;
  }

  private _state: PeerState = PeerState.none;
  /**
   * State of the peer connection.
   */
  public get state(): PeerState {
    return this._state;
  }

  private makingOffer: boolean = false;
  private ignoreOffer: boolean = false;
  private isSettingRemoteAnswerPending: boolean = false;
  public polite: boolean;

  /**
   * Constructs a new peer connection.
   * @param configuration Configuration of the RTC connection.
   * @param credential ICE credentials.
   */
  constructor(configuration: RtcConfig, credential: IceCredential, polite: boolean = false) {
    this.polite = polite;
    const turnServer: RTCIceServer = {
      credential: credential.credential,
      credentialType: 'password',
      urls: configuration.turnServers,
      username: credential.username,
    };
    const stunServer: RTCIceServer = {
      credential: credential.credential,
      credentialType: 'password',
      urls: configuration.stunServers,
      username: credential.username,
    };
    this.peerConnection = new _RTCPeerConnection({
      iceServers: [
        turnServer,
        stunServer,
      ]
    });
    this.subscribeEvents();
  }

  /**
   * Adds a new event listener.
   * @param event Name of event.
   * @param callback Callback of event.
   */
  addListener(event: PeerEvent, callback: (...args: any[]) => void): void {
    this.eventEmitter.addListener(event, callback);
  }

  /**
   * Answers a received call.
   * @param sessionId Identity of session.
   * @param socketId Identity of remote socket.
   * @param userId Identity of user of remote socket.
   * @param signallingChannel Instance of signalling socket to use.
   * @throws SIGNALLING_ERROR_ICE_TIMEOUT
   * @throws SIGNALLING_ERROR_SDP_TIMEOUT
   */
  async answerCall(sessionId: string, socketId: string, userId: string, signallingChannel: SignallingChannel): Promise<void> {
    this.establishConnection(sessionId, socketId, signallingChannel);
    // Await channel requests.
    this.channelListener = signallingChannel.addChannelListener(async (types: ChannelType[]) => {
      types.forEach(t => {
        const event: ChannelRequestEvent = {
          accept: () => {
            return this.openTxChannel(userId, t);
          },
          type: t
        };
        this.eventEmitter.emit('channelRequest', event);
      });
    }, sessionId, socketId);
  }

  /**
   * Closes the peer connection.
   * @param signallingChannel Instance of signalling socket to use.
   */
  close(signallingChannel: SignallingChannel): void {
    // Send hangup message to signalling server, if it is active.
    if (this.sessionId) signallingChannel.hangupCall(this.sessionId);
    // Workaround due to no close event of RTCPeerConnection:
    this.handleClose(signallingChannel, HangupReason.hangup);
  }

  /**
   * Connects to a remote peer.
   * @param sessionId Identity of session.
   * @param socketId Identity of remote socket.
   * @param signallingChannel Instance of signalling socket to use.
   * @throws PEER_ERROR_ICE_TIMEOUT
   * @throws PEER_ERROR_ICE_ERROR
   * @throws SIGNALLING_ERROR_SDP_TIMEOUT
   * @throws PEER_ERROR_CONNECTION_TIMEOUT
   * @throws PEER_ERROR_CONNECTION_FAILED
   */
  connect(sessionId: string, socketId: string, signallingChannel: SignallingChannel): void {
    this.establishConnection(sessionId, socketId,signallingChannel);
    // Awaits local session description and sends it to target user via signalling channel.
    this.peerConnection.createOffer(/*{ iceRestart: true, offerToReceiveVideo: true }*/).then(async (sessionDescription: RTCSessionDescriptionInit) => {
      await this.peerConnection.setLocalDescription(sessionDescription);
      if (!this.peerConnection.localDescription) throw 'Failed to set local description of peer';
      signallingChannel.sendSessionDescription(this.peerConnection.localDescription, sessionId, socketId);
    }).catch(error => {
      throw error;
    });
  }

  private subscribeTempEvents() {
    this.peerConnection.addEventListener('debug', (ev) => this.eventEmitter.emit('icecandidateerror', 'icecandidateerror', ev));
    this.peerConnection.addEventListener('debug', (ev) => this.eventEmitter.emit('statsended', 'statsended', ev));
    this.peerConnection.addEventListener('debug', (ev) => this.eventEmitter.emit('icegatheringstatechange', 'icegatheringstatechange', ev));
    this.peerConnection.addEventListener('debug', (ev) => this.eventEmitter.emit('iceconnectionstatechange', 'iceconnectionstatechange', ev));
  }

  /**
   * Establishes a connection to the remote peer.
   * @param sessionId Identity of session.
   * @param socketId Identity of remote socket.
   * @param signallingChannel Instance of signalling socket to use.
   */
  private establishConnection(sessionId: string, socketId: string, signallingChannel: SignallingChannel): void {
    this._sessionId = sessionId;
    this._remoteSocketId = socketId;
    // Awaits hangup message for the call.
    signallingChannel.receiveHangupCall(sessionId, socketId).then(reason => this.handleClose(signallingChannel, reason));
    // Awaits local ICE candidate and sends it to target via signalling channel.
    this.localCandidateListener = (event: RTCPeerConnectionIceEvent) => {
      if (!event.candidate) return;
      const iceCandidate = event.candidate;
      const json: RTCIceCandidateInit = {
        candidate: iceCandidate.candidate,
        sdpMLineIndex: iceCandidate.sdpMLineIndex,
        sdpMid: iceCandidate.sdpMid,
        usernameFragment: iceCandidate.usernameFragment
      };
      signallingChannel.sendIceCandidate(json, sessionId, socketId);
    };
    this.subscribeTempEvents();
    this.peerConnection.addEventListener('icecandidate', this.localCandidateListener);
    // Awaits remote ICE candidate.
    this.candidateListener = signallingChannel.addCandidateListener(async (candidate: RTCIceCandidateInit) => {
      try {
        if (!candidate) throw 'Invalid candidate';
        await this.peerConnection.addIceCandidate(candidate);
      } catch (error) {
        this.eventEmitter.emit('error', `Failed to add candidate ${JSON.stringify(candidate)}: ${error}`);
      }
    }, sessionId, socketId);
    // Awaits needed renegotiation.
    this.negotiationListener = async () => {
      try {
        this.makingOffer = true;
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        if (!this.peerConnection.localDescription) throw 'Failed to set local description of peer';
        signallingChannel.sendSessionDescription(this.peerConnection.localDescription, sessionId, socketId);
      } catch (error) {
        this.eventEmitter.emit('error', `Failed to negotiate: ${error}`);
      } finally {
        this.makingOffer = false;
      }
    };
    this.peerConnection.addEventListener('negotiationneeded', this.negotiationListener);
    // Awaits remote session description.
    this.descriptionListener = signallingChannel.addDescriptionListener(async (remoteDescription: RTCSessionDescriptionInit) => {
      try {
        const readyForOffer = !this.makingOffer && (this.peerConnection.signalingState === 'stable' || this.isSettingRemoteAnswerPending);
        const offerCollision = remoteDescription.type === 'offer' && !readyForOffer;
        this.ignoreOffer = !this.polite && offerCollision;

        if (this.ignoreOffer) {
          return;
        }

        this.isSettingRemoteAnswerPending = remoteDescription.type === 'answer';
        this.peerConnection.setRemoteDescription(remoteDescription);
        this.isSettingRemoteAnswerPending = false;
        if (remoteDescription.type === 'offer') {
          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
          const localDescription = this.peerConnection.localDescription;
          // this.eventEmitter.emit('error', `new local description: ${JSON.stringify(localDescription)}`);
          signallingChannel.sendSessionDescription(localDescription!, sessionId, socketId);
        }
        // if (remoteDescription.type === 'offer') {
        //   const description = await this.handleRemoteDescription(remoteDescription);
        //   signallingChannel.sendSessionDescription(description, sessionId, socketId);
        // } else if (remoteDescription.type === 'answer') {
        //   await this.peerConnection.setRemoteDescription(remoteDescription);
        // } else if (remoteDescription.type === 'rollback')
      } catch (error) {
        console.error(error);
        this.eventEmitter.emit('error', error);
      }
    }, sessionId, socketId);

  }

  /**
   * Generates a Sender Channel from type.
   * @param userId Identity of user that this channel is connected to.
   * @param peerConnection Connection to remote peer.
   * @param type Type of channel.
   */
  private generateTxChannelFromType(userId: string, peerConnection: RTCPeerConnection, type: ChannelType): TxChannel {
    switch (type) {
      case ChannelType.ecg:
        return new EcgTxChannel(userId, peerConnection);
      case ChannelType.eda:
        return new EdaTxChannel(userId, peerConnection);
      case ChannelType.eyetracking:
        return new EyeTrackingTxChannel(userId, peerConnection);
      case ChannelType.monitoring:
        return new MonitoringTxChannel(userId, peerConnection);
      case ChannelType.movement:
        return new MovementTxChannel(userId, peerConnection);
    }
  }

  /**
   * Handles closing of peer connection.
   * @param signallingChannel Signalling channel instance.
   * @param reason Reason for hangup.
   */
  private handleClose(signallingChannel: SignallingChannel, reason?: HangupReason): void {
    if (reason) this._hangupReason = reason;
    // Close the peer connection.
    console.log('closing peer');
    this.peerConnection.close();
    console.log('peer closed');
    // Remove event listeners.
    if (this.candidateListener) signallingChannel.removeListener('candidate', this.candidateListener);
    if (this.channelListener) signallingChannel.removeListener('channel', this.channelListener);
    if (this.descriptionListener) signallingChannel.removeListener('description', this.descriptionListener);
    if (this.localCandidateListener) this.peerConnection.removeEventListener('icecandidate', this.localCandidateListener);
    // Workaround due to no close event of RTCPeerConnection:
    this._state = PeerState.closed;
    this.eventEmitter.emit('closed');
  }

  /**
   * Handles the receiving of a remote session description.
   * @param description Session description of remote peer.
   * @param options Optional RTC offer options.
   * @returns Session description answer of local peer.
   */
  private async handleRemoteDescription(description: RTCSessionDescriptionInit, options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit> {
    await this.peerConnection.setRemoteDescription(description);
    const answer = await this.peerConnection.createAnswer(options);
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  /**
   * Opens a send-only channel.
   * @param userId Identity of user that the channel is connected to.
   * @param type Type of channel.
   */
  private openTxChannel(userId: string, type: ChannelType): TxChannel {
    const channel = this.generateTxChannelFromType(userId, this.peerConnection, type);
    // Subscribe describe how to handle close event.
    const onClose = () => {
      // Stop listening to close event.
      channel.removeListener('closed', onClose);
      // Remove channel from active channels.
      this._txChannels = this._txChannels.filter(c => c !== channel);
      // Emit closed channel event.
      this.eventEmitter.emit('channelClosed', channel);
    };
    channel.addListener('closed', onClose);
    this._txChannels.push(channel);
    // Emit opened channel event.
    this.eventEmitter.emit('channelOpened', channel);
    return channel;
  }

  /**
   * Removes all event listeners.
   */
  removeAllListeners(): void {
    this.eventEmitter.removeAllListeners();
  }

  /**
   * Removes an event listener.
   * @param event Name of event.
   * @param callback Callback of event.
   */
  removeListener(event: PeerEvent, callback: (...args: any[]) => void): void {
    this.eventEmitter.removeListener(event, callback);
  }

  /**
   * Requests the remote peer to open channels.
   * @param signallingChannel Channel to signalling server.
   * @param types Types of channels to open.
   */
  requestChannels(signallingChannel: SignallingChannel, ...types: ChannelType[]): Promise<RxChannel[]> {
    return new Promise((resolve, reject) => {
      try {
        // Validate, if session is already active and remote socket is already connected.
        if (!this.sessionId || !this.remoteSocketId) throw 'Invalid session';
        // Request new channels from via signalling server.
        signallingChannel.sendChannelRequest(this.sessionId, this.remoteSocketId, ...types);
        // Prepare result.
        const channels: RxChannel[] = [];
        // Describe how to handle new channel connections.
        const onOpen = (channel: RxChannel) => {
          // Ensure that channel has one of the requested types.
          const index = types.indexOf(channel.type);
          if (index < 0) return;
          // Store channel at index of matching requested type.
          channels[index] = channel;
          // Resolve when this is the last channel missing.
          if (channels.length === types.length) {
            this.removeListener('channelClosed', onOpen);
            resolve(channels);
          }
        };
        this.addListener('channelOpened', onOpen);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Subscribes necessary events.
   */
  private subscribeEvents(): void {
    this.subscribeTempEvents();
    this.peerConnection.addEventListener('connectionstatechange', () => {
      switch (this.peerConnection.connectionState) {
        case 'connecting':
          this._state = PeerState.connecting;
          this.eventEmitter.emit('connecting');
          break;
        case 'connected':
          this._state = PeerState.connected;
          this.eventEmitter.emit('connected');
          break;
        case 'closed':
        case 'disconnected':
          this._state = PeerState.closed;
          this.eventEmitter.emit('closed');
          break;
        case 'failed':
          this._state = PeerState.error;
          this.eventEmitter.emit('error', 'connection failed');
          break;
        case 'new':
          this._state = PeerState.none;
          this.eventEmitter.emit('error', 'connection is new');
          break;
      }
    });
    this.peerConnection.addEventListener('datachannel', async (ev: RTCDataChannelEvent) => {
      // TODO: Resolve this:
      const userId = 'unknown';
      const channel: RxChannel = await this.wrapToRxChannel(userId, ev.channel.label as ChannelType, ev.channel);
      // Subscribe describe how to handle close event.
      const onClose = () => {
        // Stop listening to close event.
        ev.channel.removeEventListener('close', onClose);
        // Remove channel from active channels.
        this._rxChannels = this._rxChannels.filter(c => c !== channel);
        // Emit closed channel event.
        this.eventEmitter.emit('channelClosed', channel);
      };
      ev.channel.addEventListener('close', onClose);
      // Add channel to active channels.
      this._rxChannels.push(channel);
      // Emit opened channel event.
      this.eventEmitter.emit('channelOpened', channel);
    });
    this.peerConnection.addEventListener('track', (trackEvt) => {
      if (!trackEvt.track) return;
      const track = trackEvt.track;
      console.log('track', track);
      this._tracks.push(track);
      track.addEventListener('ended', (ev) => {
        const index = this._tracks.indexOf(track);
        this._tracks.splice(index);
      });
    });
  }

  private readonly _tracks: MediaStreamTrack[] = [];
  get tracks() {
    return [...this._tracks];
  }

  /**
   * Wraps an RTC data channel to a Receive Channel of a specific type.
   * @param userId Identity of user that the channel is connected to.
   * @param type Type of channel.
   * @param channel RTC data channel to wrap.
   * @returns Wrapped Receive Channel.
   */
  private wrapToRxChannel(userId: string, type: ChannelType, channel: RTCDataChannel): Promise<RxChannel> {
    return new Promise((resolve) => {
      switch (type) {
        case ChannelType.ecg:
          resolve(new EcgRxChannel(userId, channel));
          break;
        case ChannelType.eda:
          resolve(new EdaRxChannel(userId, channel));
          break;
        case ChannelType.eyetracking:
          const trackIndex = this._tracks.findIndex((track, index) => track.kind === 'video');
          if (trackIndex >= 0) {
            resolve(new EyeTrackingRxChannel(userId, channel, this._tracks[trackIndex]));
          } else {
            const onTrack = (ev: RTCTrackEvent) => {
              this.peerConnection.removeEventListener('track', onTrack);
              resolve(new EyeTrackingRxChannel(userId, channel, ev.track));
            };
            this.peerConnection.addEventListener('track', onTrack);
          }
          break;
        case ChannelType.monitoring:
          resolve(new MonitoringRxChannel(userId, channel));
          break;
        case ChannelType.movement:
          resolve(new MovementRxChannel(userId, channel));
          break;
      }
    });
  }
}
