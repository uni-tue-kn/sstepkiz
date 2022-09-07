import { EventEmitter, Injectable } from '@angular/core';
import {
  CallOffer,
  DEFAULT_RING_TIMEOUT,
  DeviceType,
  Handset,
  Peer,
  RtcConfig,
  SenderDescription,
  SIGNALLING_ERROR_CALL_DECLINED,
  SignallingChannel,
  ChannelRequestEvent,
  PeerState,
} from '@sstepkiz';
import { Observable } from 'rxjs';
import { AuthService } from 'projects/auth/src/public-api';
import { IceApiService } from './ice-api.service';

@Injectable({ providedIn: 'root' })
export class RtcService {
  
  /**
   * Emits, when an error occurs.
   */
  readonly error: EventEmitter<any> = new EventEmitter();

  /**
   * Handles connected peers.
   */
  private readonly onPeer = new EventEmitter<{ username: string, peer: Peer }>();

  /**
   * Active peers by usernames.
   */
  private readonly peers: { [username: string]: Peer[] } = {};

  /**
   * Emits, when a call offer is received.
   */
  readonly ring: EventEmitter<Handset> = new EventEmitter();

  /**
   * Gets the available senders.
   */
  get senders(): SenderDescription {
    return this.signallingChannel ? this.signallingChannel.senders : {};
  }

  /**
   * Gets the sender with the patientId.
   */
  sender( patientId: string ): { socketId: string, userId: string } {
    // Cancel if no senders exist.
    if (!this.senders || Object.getOwnPropertyNames(this.senders).length < 1) { return null; }
    // Extract all socketId-userId pairs from senders.
    const userIds = Object.getOwnPropertyNames(this.senders);
    const userId = userIds.find(uid => uid === patientId);
    if (userId) {
      const socketId = this.senders[userId]?.slice(-1).toString();
      return { socketId, userId };
    } else {
      return undefined;
    }
  }
  

  /**
   * Connection to signalling server.
   */
  signallingChannel?: SignallingChannel;

  /**
   * Constructs a new RTC service.
   * @param authService Authentication service.
   * @param iceApiService ICE API service.
   * @param rtcConfig WebRTC configuration.
   */
  constructor(
    private readonly authService: AuthService,
    private readonly iceApiService: IceApiService,
    private readonly rtcConfig: RtcConfig
  ) {
    iceApiService.getCredentials().then(credential => {
      SignallingChannel.connectAndRegisterOauth(rtcConfig.signallingServerUrl, rtcConfig.mode, authService.accessToken, credential).then(sc => {
        this.signallingChannel = sc;
        this.signallingChannel.addListener('calloffer', (offer: CallOffer) => this.onCall(offer));
        this.signallingChannel.addListener('error', error => console.error('Signalling Channel error: ', error));
      }).catch(error => {
        console.error('Failed to connect to signalling server', error);
      });  
    });
  }

  /**
   * Calls a user.
   * @param userId Identity of user to call.
   * @param socketId Identity of user's socket to call.
   * @param mode Mode of call.
   * @returns Established peer connection.
   * @throws SIGNALLING_ERROR_CALL_REQUEST_TIMEOUT
   * @throws SIGNALLING_ERROR_INTERNAL
   * @throws SIGNALLING_ERROR_UNAVAILABLE
   * @throws SIGNALLING_ERROR_CALL_DECLINED
   * @throws SIGNALLING_ERROR_RING_TIMEOUT
   */
  async call(userId: string, socketId: string, mode: DeviceType.Monitor | DeviceType.Receiver): Promise<Peer> {
    const iceCredential = await this.iceApiService.getCredentials();
    // Request a new call.
    const callResponse = await this.signallingChannel.requestCall(socketId, mode);
    // Wait for target to accept the call.
    await this.signallingChannel.receiveCallAcception(callResponse.sessionId, socketId);
    // Create new Peer and establish connection.
    const peer = new Peer(this.rtcConfig, iceCredential, true);
    peer.connect(callResponse.sessionId, socketId, this.signallingChannel);
    this.setPeer(userId, peer);
    return peer;
  }

  /**
   * Gets all active peers to users.
   * @param username Username of peer.
   */
  getPeer(username: string): Observable<Peer> {
    return new Observable(observer => {
      if (username in this.peers) {
        const peers = this.peers[username].slice();
        peers.forEach(p => {
          observer.next(p);
        });
      }
      this.onPeer.subscribe((p: { username: string, peer: Peer }) => {
        if (p.username === username) {
          observer.next(p.peer);
        }
      });
    });
  }

  /**
   * Emits the ring event and waits for answer.
   * @param offer Received call offer.
   * @param peer Instance of peer connection.
   * @param timeout Time in ms to wait until call gets declined automatically.
   * @throws SIGNALLING_ERROR_CALL_DECLINED
   */
  private getAnswer(offer: CallOffer, peer: Peer, timeout: number = DEFAULT_RING_TIMEOUT): Promise<void> {
    return new Promise((resolve, reject) => {
      const onTimeout = () => reject(SIGNALLING_ERROR_CALL_DECLINED);
      // Create handset object to easy accept or decline the call.
      const handset: Handset = {
        accept: () => new Promise(async (resolveCall, rejectCall) => {
          clearTimeout(timeoutId);
          // Resolve outer promise to indicate that call was accepted.
          resolve();
          resolveCall(peer);
        }),
        decline: () => {
          clearTimeout(timeoutId);
          reject(SIGNALLING_ERROR_CALL_DECLINED);
        },
        offer
      };
      const timeoutId = setTimeout(onTimeout, timeout);
      // Emit ring event and give listener the handset object to accept or decline the call.
      this.ring.emit(handset);
    });
  }

  /**
   * Gets the user media.
   * @param constraints Constraints describing the user media.
   * @returns Media stream of user media.
   */
  getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream> {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        resolve(stream);
      }, error => {
        reject(error);
      });
    });
  }

  /**
   * Hangs up a call.
   * @param peer Peer connection to hangup.
   */
  hangup(peer: Peer): void {
    peer.close(this.signallingChannel);
  }

  /**
   * Handles received call request.
   * @param offer Received call offer.
   */
  private async onCall(offer: CallOffer): Promise<void> {
    const credential = await this.iceApiService.getCredentials();
    const peer = new Peer(this.rtcConfig, credential);
    try {
      // Wait for answer of ring event. This will throw an error, if declined.
      await this.getAnswer(offer, peer);
      // Accept call.
      this.signallingChannel.sendAnswer(true, offer.sessionId);
      try {
        // Connect to peer and wait until connection is established.
        await peer.answerCall(offer.sessionId, offer.socketId, offer.userId, this.signallingChannel);
        peer.addListener('channelRequest', async (ev: ChannelRequestEvent) => {
          ev.accept();
        });
      } catch (error) {
        this.error.emit(error);
      }
    } catch (error) {
      console.error(error);
      // Decline call and close connection.
      this.signallingChannel.sendAnswer(false, offer.sessionId);
      peer.close(this.signallingChannel);
    }
  }

  /**
   * Sets an active peer.
   * @param username Username to add.
   * @param peer Peer to add.
   */
  private setPeer(username: string, peer: Peer): void {
    if (peer.state === PeerState.closed) {
      return;
    }
    if (!(username in this.peers)) {
      this.peers[username] = [];
    }
    this.peers[username].push(peer);
    const onClose = () => {
      peer.removeListener('closed', onClose);
      const index = this.peers[username].indexOf(peer);
      this.peers[username].splice(index, 1);
    };
    peer.addListener('closed', onClose);
    this.onPeer.emit({ username, peer });
  }
}
