import io, { Socket } from 'socket.io-client';

import { EventEmitter } from '../common';
import { ChannelType } from '../peer/channel-type.enum';
import { IceCredential } from '../peer/ice-credential.interface';
import { AuthType } from './auth-type.enum';
import { CallAccept } from './call-accept.interface';
import { CallAnswer } from './call-answer.interface';
import { CallDecline } from './call-decline.interface';
import { CallOffer } from './call-offer.interface';
import { CallRequest } from './call-request.interface';
import { CallResponse } from './call-response.interface';
import { CandidateOffer } from './candidate-offer.interface';
import { ChannelRequest } from './channel-request.interface';
import { ConnectionResponse } from './connection-response.interface';
import { DEFAULT_CALL_REQUEST_TIMEOUT, DEFAULT_CONNECTION_TIMEOUT, DEFAULT_RING_TIMEOUT, DEFAULT_REGISTRATION_TIMEOUT, DEFAULT_RECONNECT_COUNT, DEFAULT_RECONNECT_TIMEOUT } from './default-timeouts';
import { DescriptionOffer } from './description-offer.interface';
import { DeviceType } from './device-type.enum';
import { HangupMessage } from './hangup-message.interface';
import { HangupOffer } from './hangup-offer.interface';
import { HangupReason } from './hangup-reason.enum';
import { RegistrationRequest } from './registration-request.interface';
import { RegistrationResponse } from './registration-response.interface';
import { SignallingChannelEvent } from './signalling-channel-event.type';
import { SignallingChannelState } from './signalling-channel-state.enum';
import { SignallingError } from './signalling-error.interface';
import { SIGNALLING_ERROR_CALL_DECLINED, SIGNALLING_ERROR_CALL_REQUEST_TIMEOUT, SIGNALLING_ERROR_CONNECTION_TIMEOUT, SIGNALLING_ERROR_REGISTRATION_TIMEOUT, SIGNALLING_ERROR_RING_TIMEOUT } from './signalling-errors';
import { SIGNALLING_EVENT_CALL_ACCEPT, SIGNALLING_EVENT_CALL_ANSWER, SIGNALLING_EVENT_CALL_DECLINE, SIGNALLING_EVENT_CALL_OFFER, SIGNALLING_EVENT_CALL_REQUEST, SIGNALLING_EVENT_CALL_RESPONSE, SIGNALLING_EVENT_CANDIDATE_OFFER, SIGNALLING_EVENT_CONNECTION_RESPONSE, SIGNALLING_EVENT_DESCRIPTION_OFFER, SIGNALLING_EVENT_HANGUP_MESSAGE, SIGNALLING_EVENT_HANGUP_OFFER, SIGNALLING_EVENT_REGISTRATION_REQUEST, SIGNALLING_EVENT_REGISTRATION_RESPONSE, SIGNALLING_EVENT_USER_STATE, SIGNALLING_EVENT_CHANNEL_REQUEST } from './signalling-event-names';
import { UserState } from './user-state.interface';
import { SenderDescription } from './sender-description.interface';

export class SignallingChannel {

  /**
   * Event emitter to emit internal events.
   */
  private readonly eventEmitter: EventEmitter = new EventEmitter();

  private _mode: DeviceType;
  /**
   * Gets the connection mode.
   */
  public get mode(): DeviceType {
    return this._mode;
  }

  private _senders: SenderDescription = {};
  /**
   * Gets the available senders.
   */
  get senders(): SenderDescription {
    return this._senders ? this._senders : {};
  }

  /**
   * Socket connection to signalling server.
   */
  private readonly socket: Socket;

  private _socketId?: string = undefined;
  /**
   * Gets the identity of socket or undefined if not registered.
   */
  public get socketId(): string | undefined {
    return this._socketId;
  }

  private _state: SignallingChannelState = SignallingChannelState.none;
  /**
   * Gets the current connection state.
   */
  get state(): SignallingChannelState {
    return this._state;
  }

  private _supportedAuthTypes?: AuthType[] = undefined;
  /**
   * Gets the authentication types that are supported by the server or undefined if unknown.
   */
  get supportedAuthTypes(): AuthType[] | undefined {
    return this._supportedAuthTypes;
  }

  /**
   * Constructs a new signalling channel and connects to it.
   * @param url URL of socket.
   * @param mode Device type to connect as.
   * @param timeout Optional maximum time in ms to wait for connection to signalling server.
   */
  constructor(url: string, mode: DeviceType, timeout: number = DEFAULT_CONNECTION_TIMEOUT) {
    this._mode = mode;
    // Connect to signalling server.
    this.socket = io(url, { query: { mode }, transports: ['websocket'], timeout });
    this.socket.on('reconnect', () => {
      this.eventEmitter.emit('connection');
    });
    // Update current state.
    this._state = SignallingChannelState.connecting;
    // Declare, how to handle received connection response.
    const onConnectionResponse = (response: ConnectionResponse | SignallingError) => {
      if ('error' in response) {
        // Update state.
        this._state = SignallingChannelState.error;
        // Emit error message.
        this.eventEmitter.emit('connectionerror', response);
        this.eventEmitter.emit('error', response);
      } else {
        // Store supported authentication types.
        this._supportedAuthTypes = response.authTypes;
        // Subscribe to received messages.
        this.subscribeEvents();
        // Update current state.
        this._state = SignallingChannelState.connected;
        // Emit connect event.
        this.eventEmitter.emit('connection');
      }
    };
    // Subscribe to registration response.
    this.socket.on(SIGNALLING_EVENT_CONNECTION_RESPONSE, onConnectionResponse);
  }

  /**
   * Adds a listener for a specific ICE candidate.
   * @param callback Callback when received candidate matches constraints.
   * @param sessionId Identity of session.
   * @param socketId Optional identity of socket.
   * @returns Listener callback for removal.
   */
  addCandidateListener(callback: (candidate: RTCIceCandidateInit) => void | Promise<void>, sessionId: string, socketId?: string): (candidate: CandidateOffer) => void {
    // Define listener.
    const listener = (candidate: CandidateOffer) => {
      // Verify, that identity of session matches.
      if (candidate.sessionId !== sessionId) return;
      // Verify, that identity of socket matches, if defined.
      if (socketId && candidate.socketId !== socketId) return;
      // Execute callback.
      callback(candidate.candidate);
    };
    // Subscribe to candidate event.
    this.addListener('candidate', listener);
    return listener;
  }

  /**
   * Adds a listener for a specific channel request.
   * @param callback Callback when received channel matches constraints.
   * @param sessionId Identity of session.
   * @param socketId Optional identity of socket.
   * @returns Listener callback for removal.
   */
  addChannelListener(callback: (types: ChannelType[]) => void | Promise<void>, sessionId: string, socketId?: string): (request: ChannelRequest) => void {
    // Define listener.
    const listener = (request: ChannelRequest) => {
      // Verify, that identity of session matches.
      if (request.sessionId !== sessionId) return;
      // Verify, that identity of socket matches, if defined.
      if (socketId && request.socketId !== socketId) return;
      // Execute callback.
      callback(request.types);
    }
    // Subscribe to channel event.
    this.addListener('channel', listener);
    return listener;
  }

  /**
   * Adds a listener for a specific session description.
   * @param callback Callback when received candidate matches constraints.
   * @param sessionId Identity of session.
   * @param socketId Optional identity of socket.
   * @returns Listener callback for removal.
   */
  addDescriptionListener(callback: (description: RTCSessionDescriptionInit) => void | Promise<void>, sessionId: string, socketId?: string): (description: DescriptionOffer) => void {
    // Define listener.
    const listener = (description: DescriptionOffer) => {
      // Verify, that identity of session matches.
      if (description.sessionId !== sessionId) return;
      // Verify, that identity of socket matches, if defined.
      if (socketId && description.socketId !== socketId) return;
      // Execute callback.
      callback(description.description);
    };
    // Subscribe to candidate event.
    this.addListener('description', listener);
    return listener;
  }

  /**
   * Adds an event listener.
   * @param event Name of event.
   * @param listener Event listener callback.
   */
  addListener(event: SignallingChannelEvent, listener: (...args: any[]) => void): void {
    this.eventEmitter.addListener(event, listener);
  }

  /**
   * Removes all listeners and closes connection to signalling server.
   */
  close(): void {
    this.socket.offAny();
    this.socket.close();
  }

  /**
   * Connects to a signalling server and tries to register with an OAuth Access Token.
   * @param url URL of socket.
   * @param mode Device type to connect as.
   * @param accessToken OAuth access token to authenticate with.
   * @param iceCredential ICE credentials to authenticate to the STUN/TURN server.
   * @param connectionTimeout Optional maximum time in ms to wait for connection response.
   * @param registrationTimeout Optional maximum time in ms to wait for registration response.
   * @param reconnectCount Maximum number of reconnect tries.
   * @param reconnectTimeout Number of ms to wait before reconnect.
   * @throws SIGNALLING_ERROR_AUTHENTICATION
   * @throws SIGNALLING_ERROR_CONNECTION_TIMEOUT
   * @throws SIGNALLING_ERROR_INTERNAL
   * @throws SIGNALLING_ERROR_REGISTRATION_TIMEOUT
   * @throws SIGNALLING_ERROR_UNSUPPORTED_AUTH_TYPE
   */
  static async connectAndRegisterOauth(url: string, mode: DeviceType, accessToken: string, iceCredential: IceCredential, connectionTimeout: number = DEFAULT_REGISTRATION_TIMEOUT, registrationTimeout: number = DEFAULT_REGISTRATION_TIMEOUT, reconnectCount: number = DEFAULT_RECONNECT_COUNT, reconnectTimeout: number = DEFAULT_RECONNECT_TIMEOUT): Promise<SignallingChannel> {
    let result: SignallingChannel | undefined;
    let error: any;
    while (!result && reconnectCount > 0) {
      try {
        result = await new Promise((resolve, reject) => {
          // Create new signalling channel and initiate connection.
          const channel = new SignallingChannel(url, mode, connectionTimeout);
          const onTimeout = () => {
            channel.removeAllListeners();
            reject(SIGNALLING_ERROR_CONNECTION_TIMEOUT);
          };
          // Declare, how to handle established connection.
          const onConnection = async () => {
            // Clear timeout and stop listening for new connections.
            clearTimeout(timeoutId);
            // channel.removeListener('connection', onConnection);
            try {
              // Send OAuth registration request.
              await channel.register({ accessToken }, registrationTimeout);
              resolve(channel);
            } catch (error) {
              reject(error);
            }
          };
          // Declare, how to handle errors.
          const onError = (error: any) => {
            // Clear timeout and stop listening for any events and reject with error.
            clearTimeout(timeoutId);
            channel.removeAllListeners();
            reject(error);
          };
          // Set timeout for connection.
          const timeoutId = setTimeout(onTimeout, connectionTimeout);
          // Start listening for new connections and errors.
          channel.addListener('connection', onConnection);
          channel.addListener('error', onError);
        });
        error = undefined;
      } catch (error) {
        result = undefined;
        error = error;
        reconnectCount--;
        if (reconnectCount > 0) {
          await new Promise<void>(resolve => {
            setTimeout(() => {
              resolve();
            }, reconnectTimeout);
          });
        }
      }
    }
    if (result) {
      return result;
    } else {
      throw error;
    }
  }

  /**
   * Hangs up a call.
   * @param sessionId Identity of session to hangup.
   */
  hangupCall(sessionId: string): void {
    const message: HangupMessage = { sessionId };
    this.socket.emit(SIGNALLING_EVENT_HANGUP_MESSAGE, message);
  }

  /**
   * Waits for acception of a call of a specific user in a specific session.
   * @param sessionId Identity of session.
   * @param socketId Identity of socket to receive acception from.
   * @param timeout Maximum time in ms to wait for response from signalling server.
   * @throws SIGNALLING_ERROR_CALL_DECLINED
   * @throws SIGNALLING_ERROR_RING_TIMEOUT
   */
  receiveCallAcception(sessionId: string, socketId: string, timeout: number = DEFAULT_RING_TIMEOUT): Promise<void> {
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timeoutId);
        this.socket.off(SIGNALLING_EVENT_CALL_ACCEPT, onAccept);
        this.socket.off(SIGNALLING_EVENT_CALL_DECLINE, onDecline);
      };
      const onTimeout = () => {
        cleanup();
        reject(SIGNALLING_ERROR_RING_TIMEOUT);
      };
      const onAccept = (accept: CallAccept) => {
        if (accept.sessionId === sessionId && accept.socketId === socketId) {
          cleanup();
          resolve();
        }
      };
      const onDecline = (decline: CallDecline) => {
        if (decline.sessionId === sessionId && decline.socketId === socketId) {
          cleanup();
          reject(SIGNALLING_ERROR_CALL_DECLINED);
        }
      };
      const timeoutId = setTimeout(onTimeout, timeout);
      this.socket.on(SIGNALLING_EVENT_CALL_ACCEPT, onAccept);
      this.socket.on(SIGNALLING_EVENT_CALL_DECLINE, onDecline);
    });
  }

  /**
   * Waits for hangup of specific socket in a specific session.
   * @param sessionId Identity of session.
   * @param socketId Identity of socket.
   * @returns Reason for hangup.
   */
  receiveHangupCall(sessionId: string, socketId: string): Promise<HangupReason> {
    return new Promise((resolve) => {
      const onHangup = (hangup: HangupOffer) => {
        // Validate identity of session.
        if (hangup.sessionId !== sessionId) return;
        // Validate identity of socket.
        if (hangup.socketId !== socketId) return;
        // Unsubscribe hangup offer event and resolve.
        this.socket.off(SIGNALLING_EVENT_HANGUP_OFFER, onHangup);
        resolve(hangup.reason);
      };
      // Subscribe hangup offer event.
      this.socket.on(SIGNALLING_EVENT_HANGUP_OFFER, onHangup);
    });
  }

  /**
   * Registers at signalling channel.
   * @param options Registration options.
   * @param timeout Optional maximum time in ms to wait for registration response.
   * @returns Description of available senders or undefined if no senders.
   * @throws SIGNALLING_ERROR_AUTHENTICATION
   * @throws SIGNALLING_ERROR_REGISTRATION_TIMEOUT
   * @throws SIGNALLING_ERROR_UNSUPPORTED_AUTH_TYPE
   */
  register(options: RegistrationRequest, timeout: number = DEFAULT_REGISTRATION_TIMEOUT): Promise<string> {
    return new Promise((resolve, reject) => {
      // Update state.
      this._state = SignallingChannelState.registering;
      // Declare, how to handle received registration response.
      const onRegistrationResponse = (response: RegistrationResponse | SignallingError) => {
        // Clear the set timeout and stop listening for registration responses.
        clearTimeout(timeoutId);
        this.socket.off(SIGNALLING_EVENT_REGISTRATION_RESPONSE, onRegistrationResponse);
        if ('error' in response) {
          // Update state.
          this._state = SignallingChannelState.connected;
          // Emit error message.
          this.eventEmitter.emit('registrationerror', response);
          this.eventEmitter.emit('error', response);
          reject(response.error);
        } else {
          // Store socket identity.
          this._socketId = response.socketId;
          // Store senders.
          this._senders = response.senders ?? {};
          // Update state.
          this._state = SignallingChannelState.registered;
          // Emit registration message and resolve.
          this.eventEmitter.emit('registration', response.senders);
          resolve(response.socketId);
        }
      };
      // Declare how to handle timeouts.
      const onTimeout = () => {
        // Unsubscribe received registration response.
        this.socket.off(SIGNALLING_EVENT_REGISTRATION_RESPONSE, onRegistrationResponse);
        // Emit timeout events and reject with error message.
        this.eventEmitter.emit('registrationerror', 'Timeout');
        this.eventEmitter.emit('error', 'Registration timeout');
        reject(SIGNALLING_ERROR_REGISTRATION_TIMEOUT);
      };
      // Send registration request.
      this.socket.emit(SIGNALLING_EVENT_REGISTRATION_REQUEST, options);
      // Set registration timeout.
      const timeoutId = setTimeout(onTimeout, timeout);
      // Subscribe received registration responses.
      this.socket.on(SIGNALLING_EVENT_REGISTRATION_RESPONSE, onRegistrationResponse);
    });
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
   * @param listener Event listener callback.
   */
  removeListener(event: SignallingChannelEvent, listener: (...args: any[]) => void): void {
    this.eventEmitter.removeListener(event, listener);
  }

  /**
   * Requests a call.
   * @param socketId Identity of socket to call.
   * @param mode Mode of call.
   * @param timeout Maximum time in ms to wait for response from signalling server.
   * @returns Response from signalling server.
   * @throws SIGNALLING_ERROR_CALL_REQUEST_TIMEOUT
   */
  requestCall(socketId: string, mode: DeviceType.Monitor | DeviceType.Receiver, timeout: number = DEFAULT_CALL_REQUEST_TIMEOUT): Promise<CallResponse> {
    return new Promise((resolve, reject) => {
      const onTimeout = () => {
        // Stop waiting for call response and reject timeout.
        this.socket.off(SIGNALLING_EVENT_CALL_RESPONSE, onResponse);
        reject(SIGNALLING_ERROR_CALL_REQUEST_TIMEOUT);
      }
      const onResponse = (response: CallResponse) => {
        // Clear timeout and stop waiting for call response.
        clearTimeout(timeoutId);
        this.socket.off(SIGNALLING_EVENT_CALL_RESPONSE, onResponse);
        // Resolve, received call response.
        resolve(response);
      };
      // Set timeout and start waiting for call response.
      const timeoutId = setTimeout(onTimeout, timeout);
      this.socket.on(SIGNALLING_EVENT_CALL_RESPONSE, onResponse);
      // Generate call request and send it to signalling server.
      const request: CallRequest = { mode, socketId };
      this.socket.emit(SIGNALLING_EVENT_CALL_REQUEST, request);
    });
  }

  /**
   * Answers a call.
   * @param accepted Indicates if user accepted the call.
   * @param sessionId Identity of session.
   */
  sendAnswer(accepted: boolean, sessionId: string): void {
    const answer: CallAnswer = { accepted, sessionId };
    this.socket.emit(SIGNALLING_EVENT_CALL_ANSWER, answer);
  }

  /**
   * Sends a channel request.
   * @param sessionId Identity of session.
   * @param socketId Identity of socket to send request to.
   * @param types Type of requested channel.
   */
  sendChannelRequest(sessionId: string, socketId: string, ...types: ChannelType[]): void {
    const request: ChannelRequest = { sessionId, socketId, types };
    this.socket.emit(SIGNALLING_EVENT_CHANNEL_REQUEST, request);
  }

  /**
   * Sends an ICE candidate to a specific user in a specific session.
   * @param candidate ICE candidate to send.
   * @param sessionId Identity of session.
   * @param socketId Identity of socket to send ICE candidate to.
   */
  sendIceCandidate(candidate: RTCIceCandidateInit, sessionId: string, socketId: string): void {
    const message: CandidateOffer = { candidate, sessionId, socketId };
    this.socket.emit(SIGNALLING_EVENT_CANDIDATE_OFFER, message);
  }

  /**
   * Sends a session description to a specific user in a specific session.
   * @param description Session description to send.
   * @param sessionId Identity of session.
   * @param socketId Identity of socket to send description to.
   */
  sendSessionDescription(description: RTCSessionDescriptionInit, sessionId: string, socketId: string): void {
    const message: DescriptionOffer = { description, sessionId, socketId };
    this.socket.emit(SIGNALLING_EVENT_DESCRIPTION_OFFER, message);
  }

  /**
   * Subscribes all necessary socket events.
   */
  private subscribeEvents(): void {
    this.socket.on(SIGNALLING_EVENT_CANDIDATE_OFFER, (candidate: CandidateOffer) => this.eventEmitter.emit('candidate', candidate));
    this.socket.on(SIGNALLING_EVENT_CALL_OFFER, (offer: CallOffer) => this.eventEmitter.emit('calloffer', offer));
    this.socket.on(SIGNALLING_EVENT_CHANNEL_REQUEST, (request: ChannelRequest) => this.eventEmitter.emit('channel', request))
    this.socket.on(SIGNALLING_EVENT_DESCRIPTION_OFFER, (description: DescriptionOffer) => this.eventEmitter.emit('description', description));
    this.socket.on(SIGNALLING_EVENT_USER_STATE, (state: UserState) => this.updateUserState(state));
  }

  /**
   * Updates the state of a user.
   * @param state State of user.
   */
  private updateUserState(state: UserState): void {
    if (state.available === true) {
      if (!this._senders.hasOwnProperty(state.userId)) {
        // Create user in senders if not yet done.
        this._senders[state.userId] = [];
      } else if(this._senders[state.userId].indexOf(state.socketId)) {
        // Cancel adding of socket, if sender already found.
        return;
      }
      // Add new sender to senders.
      this._senders[state.userId].push(state.socketId);
    } else if (this._senders.hasOwnProperty(state.userId)) {
      // Remove offline socket from senders.
      this._senders[state.userId] = this._senders[state.userId].filter(socketId => socketId !== state.socketId);
      // Delete whole user from senders, if there is no sender left.
      if (this._senders[state.userId].length === 0) {
        delete this._senders[state.userId];
      }
    }
    this.eventEmitter.emit('userstatechange', state);
  }
}
