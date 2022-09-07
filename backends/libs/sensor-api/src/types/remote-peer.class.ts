import { EventManager } from "./event-manager.class";
import { RTCPeerConnection, MediaStreamTrack } from 'wrtc';
import { sleep } from "./sleep.function";

/**
 * Available Remote Peer Events.
 */
export type RemotePeerEvent = 'channel' | 'close' | 'end' | 'error' | 'open' | 'opening' | 'track';
/**
 * Generalization of a Remote Peer Event Listener.
 */
type RemotePeerEventListener = (...args: any) => void | Promise<void>;

/**
 * Available Remote Peer states.
 */
export type RemotePeerState = 'close' | 'error' | 'new' | 'open' | 'opening';

/**
 * Description of a RTC Data Channel.
 */
export interface DataChannelDescription {
  /**
   * Configuration of RTC Data Channel.
   */
  config?: RTCDataChannelInit;

  /**
   * Label of data channel.
   */
  label: string;
}

/**
 * Description of a Transceiver.
 */
export interface TransceiverDescription {
  /**
   * RTP Transceiver configuration.
   */
  config?: RTCRtpTransceiverInit;

  /**
   * Kind or instance of Media Stream Track.
   */
  trackOrKind: string | MediaStreamTrack;
}

/**
 * Callback which offers the local Session Description to the remote peer and awaits its response.
 */
export type SessionDescriptionOfferCallback = (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>;

/**
 * Description of an RTC Data Channel or a Media Stream Track.
 */
export type ChannelDescription = DataChannelDescription | MediaStreamTrack | TransceiverDescription;

/**
 * Remote Peer error.
 */
export type RemotePeerError = any;

/**
 * Configuration of a Remote Peer.
 */
export interface RemotePeerConfiguration {
  /**
   * (Re)connection timeout in ms.
   */
  timeout?: number;

  /**
   * RTC Peer Connection configuration.
   */
  rtcConfig?: RTCConfiguration;

  /**
   * Callback which offers the local Session Description to the remote peer and awaits its response.
   */
  exchangeSession: SessionDescriptionOfferCallback;
}

/**
 * Default connection timeout in ms.
 */
const DEFAULT_CONNECT_TIMEOUT = 60000; // 60s.

/**
 * A WebRTC Connection to a remote peer.
 */
export class RemotePeer {
  /**
   * Stores all active Data Channels.
   */
  private _activeChannels: { [label: string]: RTCDataChannel } = {};
  /**
   * Gets all active Data Channels.
   */
  get activeChannels(): RTCDataChannel[] {
    const labels = Object.getOwnPropertyNames(this._activeChannels);
    const channels = labels.map(l => this._activeChannels[l]);
    return [...channels];
  }

  /**
   * Stores all active Media Stream Tracks.
   */
  private _activeTracks: { [label: string]: MediaStreamTrack } = {};
  /**
   * Gets all active Media Stream Tracks.
   */
  get activeTracks(): MediaStreamTrack[] {
    const labels = Object.getOwnPropertyNames(this._activeTracks);
    const tracks = labels.map(l => this._activeTracks[l])
    return [...tracks];
  }
  /**
   * Gets all active Audio Stream Tracks.
   */
  get activeAudioTracks(): MediaStreamTrack[] {
    return [...this.activeTracks.filter(t => t.kind === 'audio')];
  }
  /**
   * Gets all active Video Stream Tracks.
   */
  get activeVideoTracks(): MediaStreamTrack[] {
    return [...this.activeTracks.filter(t => t.kind === 'video')];
  }
  /**
   * Gets the active RTP Transceivers.
   */
  get activeTransceivers(): RTCRtpTransceiver[] {
    return this.pc?.getTransceivers() ?? [];
  }

  /**
   * Number of connect tries.
   */
  private connectTries: number = 0;

  /**
   * Indicates if negotiation is running.
   */
  private isNegotiating: boolean = false;

  /**
   * Manages events.
   */
  private readonly evt = new EventManager<RemotePeerEvent, RemotePeerEventListener>();

  /**
   * Gets if peer connection is still active.
   */
  get isActive(): boolean {
    return this.state === 'open' || this.state === 'opening';
  }

  /**
   * Indicates if reconnecting will be tried after fail.
   */
  private reconnect: boolean = false;

  /**
   * Gets the current state of the remote peer connection.
   */
  get state(): RemotePeerState {
    switch (this.pc?.connectionState ?? 'new') {
      case 'closed':
        return this.reconnect ? 'opening' : 'close';
      case 'connected':
        return 'open';
      case 'connecting':
        return 'opening';
      case 'disconnected':
        return this.reconnect ? 'opening' : 'close';
      case 'failed':
        return this.reconnect ? 'opening' : 'error';
      case 'new':
      default:
        return this.reconnect ? 'opening' : 'new';
    }
  }

  /**
   * Active RTC Peer Connection or undefined if not active.
   */
  private pc?: RTCPeerConnection = undefined;

  /**
   * Creates a new RTC Peer Connection to another remote peer.
   * @param config Configuration of peer connection.
   */
  constructor(private readonly config: RemotePeerConfiguration) {}

  /**
   * Adds a new Media Stream Track to stream to the remote peer.
   * @param track Media Stream Track to add.
   * @returns RTC RTP Sender instance which sends the stream.
   * @throws If peer is not active.
   */
  addTrack(track: MediaStreamTrack): RTCRtpSender {
    // Ensure that Peer Connection exists.
    if (!this.pc) throw 'No active RTC Peer Connection';
    // Add track to RTC Peer Connection.
    const sender = this.pc.addTrack(track);
    // Fire the track event with the added track.
    if (!track.muted) {
      this.evt.fire('track', track);
    } else {
      const onUnmuted = () => {
        track.removeEventListener('unmute', onUnmuted);
        this.evt.fire('track', track);
      };
      track.addEventListener('unmute', onUnmuted);
    }
    // Return the sender of the track.
    return sender;
  }

  /**
   * Adds a new RTP Transceiver to the remote peer.
   * @param trackOrKind Kind or instance of Media Stream Track for transceiver.
   * @param init Initial transceiver configuration.
   * @returns Generated RTC RTP Transceiver instance which handles the stream.
   * @throws If peer is not active.
   */
  addTransceiver(trackOrKind: string | MediaStreamTrack, init?: RTCRtpTransceiverInit): RTCRtpTransceiver {
    // Ensure that Peer Connection exists.
    if (!this.pc) throw 'No active RTC Peer Connection';
    // Add transceiver to RTC Peer Connection.
    const transceiver = this.pc.addTransceiver(trackOrKind, init);
    // Fire track event with transceiver's track.
    switch (transceiver.direction) {
      case 'recvonly':
      case 'sendrecv':
        {
          const onUnmute = () => {
            this.evt.fire('track', transceiver.receiver.track);
            transceiver.receiver.track.removeEventListener('unmute', onUnmute);
          };
          if (!transceiver.receiver.track.muted) {
            this.evt.fire('track', transceiver.receiver.track);
          } else {
            transceiver.receiver.track.addEventListener('unmute', onUnmute);
          }
        }
        break;
      case 'sendonly':
      case 'sendrecv':
        {
          const onUnmute = () => {
            this.evt.fire('track', transceiver.sender.track);
            transceiver.sender.track.removeEventListener('unmute', onUnmute);
          };
          if (!transceiver.receiver.track.muted) {
            this.evt.fire('track', transceiver.sender.track);
          } else {
            transceiver.sender.track.addEventListener('unmute', onUnmute);
          }
        }
        break;
    }
    // Return the new transceiver.
    return transceiver;
  }

  /**
   * Closes the connection to the remote peer.
   */
   async close(): Promise<void> {
    // Cancel, if not active anymore.
    if (!this.isActive) return;
    await new Promise<void>(resolve => {
      this.on('end', (error) => {
        resolve();
      });
      // Close RTC Peer Connection.
      this.pc?.close();
    });
  }

  /**
   * Creates a new RTC Peer Connection and subscribes to its relevant events.
   * @param results Resulting Data Channels and RTP Senders.
   * @param channels Description of initial RTC Data Channel to create or Media Stream Track to send.
   */
  private async connect(results: (RTCDataChannel | RTCRtpTransceiver | RTCRtpSender)[], ...channels: ChannelDescription[]): Promise<void> {
    // Count connection try.
    this.connectTries++;
    // Prepare temporary variable for error.
    let error: RemotePeerError = undefined;
    // Prepare resulting Data Channels and RTP Senders.
    // Create new RTC Peer Connection.
    this.pc = new RTCPeerConnection(this.config.rtcConfig);
    this.pc.addEventListener('iceconnectionstatechange', async () => {
      if (this.pc.iceConnectionState === 'failed') {
        this.pc.restartIce();
      }
      if (this.pc?.iceConnectionState === 'disconnected') {
        this.reset();
        results.length = 0;
        await sleep(500);
        this.connect(results, ...channels);
      }
    });
    // Subscribe relevant events.
    this.pc.addEventListener('connectionstatechange', () => {
      switch (this.pc?.connectionState) {
        case 'closed':
          // Only report closed when not reconnecting.
          if (this.reconnect) {
            this.evt.fire('end', error);
          }
          // Clears the RTC Peer Connection.
          this.reset();
          break;
        case 'connected':
          this.evt.fire('open');
          break;
        case 'connecting':
          this.evt.fire('opening', this.connectTries);
          break;
        case 'disconnected':
          this.evt.fire('close');
          // Close peer connection after disconnect.
          this.pc.close();
          break;
        case 'failed':
          error = 'Connection failed';
          this.evt.fire('error', error);
          // Close peer connection after fail.
          this.pc.close();
          break;
        case 'new':
        default:
          break;
      }
    });
    this.pc.addEventListener('datachannel', (ev) => {
      if (!(ev?.channel)) return;
      // Get the new channel.
      const channel = ev.channel;
      // Prepare callback to handle closing of channel.
      const onClose = (ev: Event) => {
        // Stop listening.
        channel.removeEventListener('close', onClose);
        // Remove channel from active channels.
        delete this._activeChannels[channel.label];
      };
      // Subscribe to closing of channel.
      channel.addEventListener('close', onClose);
      // Add new channel to active channels.
      this._activeChannels[channel.label] = channel;
      // Announce new channel.
      this.evt.fire('channel', channel);
    });
    this.pc.addEventListener('track', (ev) => {
      // Ensure that track still exists.
      if (!(ev?.track)) return;
      // Get the new track.
      const track = ev.track;
      // Prepare callback to handle end of track.
      const onEnded = (ev: Event) => {
        // Stop listening.
        track.removeEventListener('ended', onEnded);
        // Remove track from active tracks.
        delete this._activeTracks[track.label];
      };
      // Subscribe to end of track.
      track.addEventListener('ended', onEnded);
      // Add new track to active tracks.
      this._activeTracks[track.label] = track;
      // Announce new track.
      if (!track.muted) {
        this.evt.fire('track', track);
      } else {
        const onUnmuted = () => {
          track.removeEventListener('unmute', onUnmuted);
          this.evt.fire('track', track);
        };
        track.addEventListener('unmute', onUnmuted);
      }
    });
    // Open data and media channels.
    results.push(...channels.map((ch) => {
      try {
        if (ch instanceof MediaStreamTrack) {
          // Add track to Peer Connection.
          return this.addTrack(ch);
        } else if ('trackOrKind' in ch) {
          // Create new RTP Transceiver and add it to the Peer Connection.
          return this.addTransceiver(ch.trackOrKind, ch.config);
        } else {
          // Create new Data Channel and add it to the Peer Connection.
          return this.createChannel(ch.label, ch.config);
        }
      } catch (error) {
        // This should never happen.
        return undefined;
      }
    }));
    // await sleep(1000);
    // Subscribe negotiation needed event to renegotiate automatically when needed.
    // Negotiate the connection.
    await this.negotiate(this.config.exchangeSession);
    await sleep(100000);
    const onNegotiationNeeded = async (ev) => {
      await this.negotiate(this.config.exchangeSession);
    };
    this.pc.addEventListener('negotiationneeded', onNegotiationNeeded);
  }

  /**
   * Awaits ICE Gathering State changes.
   * @param preferredState ICE Gathering State to await or undefined if waiting for any changes.
   * @returns New ICE Gathering State.
   * @throws If peer is not active.
   */
  async iceGatheringChange(preferredState?: RTCIceGatheringState): Promise<RTCIceGatheringState> {
    // Await change of ICE Gathering State.
    const result = await new Promise<RTCIceGatheringState>((resolve) => {
      // Ensure that Peer Connection is active.
      if (!this.pc) throw 'No active RTC Peer Connection';
      if (this.pc.iceGatheringState === preferredState) {
        resolve(this.pc.iceGatheringState);
        return;
      }
      // Generate callback when ICE Gathering State changed.
      const onChange = () => {
        // Ensure that Peer Connection is still active.
        if (!this.pc) throw 'No active RTC Peer Connection';
        // Verify if preferred state is either not given or equal to new ICE Gathering State.
        if (!preferredState || this.pc.iceGatheringState === preferredState) {
          // Unsubscribe from ICE Gathering State changes.
          this.pc.removeEventListener('icegatheringstatechange', onChange);
          // Resolve with new ICE Gathering State.
          resolve(this.pc.iceGatheringState);
        }
      };
      // Subscribe to ICE Gathering State changes.
      this.pc.addEventListener('icegatheringstatechange', onChange);
    });
    // Return new ICE Gathering State.
    return result;
  }

  /**
   * Generates a new Session Description offer.
   * @returns Created Session Description offer.
   * @throws If peer is not active.
   * @throws Local Session Description generation failed.
   */
  private async createOffer(): Promise<RTCSessionDescriptionInit> {
    try {
      // Ensure that Peer Connection is active.
      if (!this.pc) throw 'No active RTC Peer Connection';
      // Generate a new RTP Session Description Offer.
      const offer = await this.pc.createOffer({ iceRestart: true, offerToReceiveAudio: true, offerToReceiveVideo: true });
      // Return new RTP Session Description Offer.
      return offer;
    } catch (error) {
      throw `Failed to create new Session Description offer: ${error}`;
    }
  }

  /**
   * Sets the local Session Description.
   * @param description Session Description to set or undefined if peer connection should generate its own description.
   * @throws If peer is not active.
   * @throws Local Session Description cannot be applied.
   */
  private async setLocalDescription(description?: RTCSessionDescriptionInit): Promise<void> {
    try {
      // Ensure that Peer Connection is active.
      if (!this.pc) throw 'No active RTC Peer Connection';
      // Apply new Session Description if given.
      if (description) {
        await this.pc.setLocalDescription(description);
      } else {
        await this.pc.setLocalDescription(/*{type: 'rollback'}*/);
      }
    } catch (error) {
      throw `Failed to set local Session Description: ${error}`;
    }
  }

  /**
   * Sets the remote Session Description.
   * @param description Session Description to set.
   * @throws If peer is not active.
   * @throws Remote Session Description cannot be applied.
   */
  private async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    try {
      // Ensure that Peer Connection is active.
      if (!this.pc) throw 'No active RTC Peer Connection';
      if (description.type === 'offer') {
        throw 'SDP ANSWER IS NOT AN OFFER!';
      }
      if (this.pc.signalingState === 'stable') {
        throw 'SIGNALING STATE IS STABLE! ' + this.pc.signalingState;
      }
      // Apply remote Session Description.
      await this.pc.setRemoteDescription(description);
    } catch (error) {
      throw `Failed to set remote Session Description: ${error}`;
    }
  }

  /**
   * Sends a Session Description offer to a remote peer and receives its remote Session Description.
   * @param offerCallback Callback to send Session Description offer to remote peer.
   * @returns Received remote Session Description answer.
   * @throws If peer is not active.
   * @throws Errors caused by executing the offer callback.
   */
  private async offerLocalDescription(offerCallback: SessionDescriptionOfferCallback): Promise<RTCSessionDescriptionInit> {
    try {
      // Ensure that Peer Connection is active.
      if (!this.pc) throw 'No active RTC Peer Connection';
      // Get local Session Description.
      const localDescription = this.pc.localDescription;
      if (!localDescription) {
        throw 'Local description not set!';
      }
      // Offer local Session Description to remote peer and await answer.
      const result = await offerCallback(localDescription);
      // Return Session Description answer.
      return result;
    } catch (error) {
      throw `Failed to offer local description to remote peer: ${error}`;
    } finally {
      await sleep(10000);
    }
  }

  /**
   * Negotiates the connection.
   * @param offerCallback Callback to send Session Description offer to remote peer.
   * @throws If peer is not active.
   * @throws Local Session Description generation failed.
   * @throws Local Session Description cannot be applied.
   * @throws Errors caused by executing the offer callback.
   * @throws Remote Session Description cannot be applied.
   */
  private async negotiate(offerCallback: SessionDescriptionOfferCallback): Promise<void> {
    if (this.isNegotiating) return;
    this.isNegotiating = true;
    try {
      // Generate new RTP Session Description offer.
      const offer = await this.createOffer();
      // Apply local Session Description.
      await this.setLocalDescription(offer);
      await new Promise<void>((resolve) => {
        if (this.pc.iceGatheringState === 'complete') {
          resolve();
        } else {
          const checkState = () => {
            if (this.pc.iceGatheringState === 'complete') {
              this.pc.removeEventListener('icegatheringstatechange', checkState);
              resolve();
            }
          };
          this.pc.addEventListener('icegatheringstatechange', checkState);
        }
      });
      const answer = await this.offerLocalDescription(offerCallback);
      // const [answer,] = await Promise.all([
      //   // Send Session Description to remote peer.
      //   this.offerLocalDescription(offerCallback),
      //   // Wait until ICE Gathering State completed.
      //   this.iceGatheringChange('complete'),
      // ]);
      // Apply received Session Description answer as remote Session Description.
      await this.setRemoteDescription(answer);
    } catch (error) {
      throw `Failed to negotiate connection! ${error}`;
    } finally {
      this.isNegotiating = false;
    }
  }

  /**
   * Creates a new Data Channel to the remote peer.
   * @param label Label of new Data Channel.
   * @param options Options of new Data Channel.
   * @returns Created Data Channel.
   * @throws If peer is not active.
   */
  createChannel(label: string, options?: RTCDataChannelInit): RTCDataChannel {
    // Ensure that Peer Connection exists.
    if (!this.pc) throw 'No active RTC Peer Connection';
    // Create a new Data Channel.
    const newChannel = this.pc.createDataChannel(label, options);
    // Fire channel event when created channel is open.
    newChannel.addEventListener('open', (ev) => {
      this.evt.fire('channel', newChannel);
    });
    if (newChannel.readyState === 'open') {
      this.evt.fire('channel', newChannel);
    }
    // Return new Data Channel.
    return newChannel;
  }

  /**
   * Unsubscribes from new Data Channel.
   * @param event Channel event.
   * @param listener Listener callback to stop.
   */
  off(event: 'channel', listener: (channel: RTCDataChannel) => void | Promise<void>): void;
  /**
   * Unsubscribes from closing of connection to remote peer.
   * @param event Close event.
   * @param listener Listener callback to stop.
   */
  off(event: 'close', listener: () => void | Promise<void>): void;
  /**
   * Unsubscribes from ended connection by failure or closing.
   * @param event End event.
   * @param listener Listener callback to stop.
   */
  off(event: 'end', listener: () => void | Promise<void>): void;
  /**
   * Unsubscribes from connection failure to a remote peer.
   * @param event Error event.
   * @param listener Listener callback to stop.
   */
  off(event: 'error', listener: (error: RemotePeerError) => void | Promise<void>): void;
  /**
   * Unsubscribes from connection establishment to a remote peer.
   * @param event Open event.
   * @param listener Listener callback to stop.
   */
  off(event: 'open', listener: () => void | Promise<void>): void;
  /**
   * Unsubscribes from opening the connection to the remote peer.
   * @param event Opening event.
   * @param listener Listener callback to stop.
   */
  off(event: 'opening', listener: (connectTries: number) => void | Promise<void>): void;
  /**
   * Unsubscribes from new Media Stream Track.
   * @param event Track event.
   * @param listener Listener callback to stop.
   */
  off(event: 'track', listener: (track: MediaStreamTrack) => void | Promise<void>): void;
  /**
   * Unsubscribe from an event.
   * @param event Event to stop listen.
   * @param listener Listener callback to stop.
   */
  off(event: RemotePeerEvent, listener: RemotePeerEventListener): void {
    this.evt.off(event, listener);
  }

  /**
   * Subscribes to a new Data Channel.
   * @param event Channel event.
   * @param listener Callback when new Data Channel was opened.
   */
  on(event: 'channel', listener: (channel: RTCDataChannel) => void | Promise<void>): void;
  /**
   * Subscribes to closing of connection to remote peer.
   * @param event Close event.
   * @param listener Callback when connection was closed.
   */
  on(event: 'close', listener: () => void | Promise<void>): void;
  /**
   * Subscribes to an ended connection by failure or by closing.
   * @param event End event.
   * @param listener Callback when connection to remote peer ended.
   */
  on(event: 'end', listener: (error?: RemotePeerError) => void | Promise<void>): void;
  /**
   * Subscribes to connection failure to a remote peer.
   * @param event Error event.
   * @param listener Callback when connection to remote peer failed.
   */
  on(event: 'error', listener: (error: RemotePeerError) => void | Promise<void>): void;
  /**
   * Subscribes to connection establishment to a remote peer.
   * @param event Open event.
   * @param listener Callback when connection to the remote peer was established.
   */
  on(event: 'open', listener: () => void | Promise<void>): void;
  /**
   * Subscribes to opening the connection to the remote peer.
   * @param event Opening event.
   * @param listener Callback when opening the connection to the remote peer.
   */
  on(event: 'opening', listener: (connectTries: number) => void | Promise<void>): void;
  /**
   * Subscribes to a new Media Stream Track.
   * @param event Track event.
   * @param listener Callback when a new Media Stream Track was started.
   */
  on(event: 'track', listener: (track: MediaStreamTrack) => void | Promise<void>): void;
  /**
   * Subscribes to an event.
   * @param event Event to listen.
   * @param listener Listener callback.
   */
  on(event: RemotePeerEvent, listener: RemotePeerEventListener): void {
    this.evt.on(event, listener);
  }

  /**
   * Opens connection to remote peer.
   * @param channels Description of initial RTC Data Channel to create or Media Stream Track to send.
   * @returns Array of initially opened Data Channels or RTC RTP Senders in order of given channels parameter.
   * @throws When connection timed out.
   */
  async open(...channels: ChannelDescription[]): Promise<(RTCDataChannel | RTCRtpTransceiver | RTCRtpSender)[]> {
    // Break if already connected or connecting.
    if (this.pc) return;
    // Prepare all connection-relevant state variables.
    this.connectTries = 0;
    this.reconnect = true;
    // Create temporary variable to keep track of timeout.
    let timedOut = false;
    // Prepare resulting array.
    const results: (RTCDataChannel | RTCRtpTransceiver | RTCRtpSender)[] = [];
    try {
      await Promise.race([
        new Promise<void>(async (resolve) => {
          // (Re)try to connect until timed out or connecting succeeded.
          while (!timedOut && !(await this.tryConnect(results, ...channels))) {
            await sleep(100);
            results.length = 0;
          }
          resolve();
        }),
        new Promise<void>((_, reject) => {
          // Set timeout.
          setTimeout(() => {
            timedOut = true;
            // Indicate that timed out.
            reject('Connection timeout');
          }, this.config.timeout ?? DEFAULT_CONNECT_TIMEOUT);
        }),
      ]);
      // Return resulting array if not timed out.
      return results;
    } catch (error) {
      this.reset();
      throw error;
    } finally {
      // Update all connection-relevant state variables.
      this.reconnect = false;
    }
  }

  /**
   * Stops streaming of a Media Stream Track to the remote peer.
   * @param trackSender RTC RTP Sender instance which sends the track to remove.
   */
  removeTrack(trackSender: RTCRtpSender): void {
    // Ensure thatS RTC Peer Connection is established.
    if (!this.isActive) return;
    // Removes the track.
    this.pc.removeTrack(trackSender);
  }

  /**
   * Resets the peer instance.
   */
  private reset(): void {
    // Clears the array of active channels.
    this._activeChannels = {};
    // Clears the array of active tracks.
    this._activeTracks = {};
    // Clear the RTC Peer Connection.
    this.pc = undefined;
  }

  /**
   * Tries to connect to the remote peer.
   * @param results Resulting Data Channels and RTP Senders.
   * @param channels Description of initial RTC Data Channel to create or Media Stream Track to send.
   * @returns true = successful, false = failed.
   */
  private async tryConnect(results: (RTCDataChannel | RTCRtpTransceiver | RTCRtpSender)[], ...channels: ChannelDescription[]): Promise<boolean> {
    // Await connection result.
    const succeeded = await new Promise<boolean>(async (resolve) => {
      // Prepare callbacks.
      const onEnded = (error?: RemotePeerError) => {
        // Unsubscribe events.
        this.off('end', onEnded);
        this.off('open', onOpen);
        // Resolve that connecting was not successful.
        resolve(false);
      };
      const onOpen = () => {
        // Unsubscribe events.
        this.off('end', onEnded);
        this.off('open', onOpen);
        // Resolve that connecting was successful.
        resolve(true);
      };
      // Subscribe events.
      this.on('end', onEnded);
      this.on('open', onOpen);
      // Start connect.
      try {
        await this.connect(results, ...channels);
      } catch (error) {
        resolve(false);
      }
    });
    // Return if connection try was successful.
    return succeeded;
  }
}
