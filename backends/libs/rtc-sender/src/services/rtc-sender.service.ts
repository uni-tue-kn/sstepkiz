import { AuthService } from '@libs/client-auth';
import { LoggerService } from '@libs/logger';
import { Injectable } from '@nestjs/common';
import {
  CallOffer,
  ChannelRequestEvent,
  ChannelType,
  EventEmitter,
  MonitoringData,
  Peer,
  RtcConfig,
  SensorData,
  SignallingChannel,
  TxChannel,
} from '../../../../../shared/dist';

import { RtcSenderServiceEvent } from '../types/rtc-sender-service-event.type';
import { IceApiService } from './ice-api.service';

@Injectable()
export class RtcSenderService {
  /**
   * Active sender channels.
   */
  private readonly channels: { [type: string]: TxChannel[] } = {
    ecg: [],
    eda: [],
    etk: [],
    mon: [],
    mov: [],
  };

  /**
   * Event emitter.
   */
  private readonly eventEmitter: EventEmitter = new EventEmitter();

  /**
   * Active peer connections.
   */
  private readonly peers: Peer[] = [];

  /**
   * Channel to signalling server or undefined.
   */
  private signallingChannel?: SignallingChannel;

  /**
   * Handles received call offer.
   * @param offer Received call offer.
   */
  private readonly onCallOffer = async (offer: CallOffer) => {
    this.loggerService.debug(`Received call offer in mode ${offer.mode} from user ${offer.userId} with socket ID ${offer.socketId} in session with ID ${offer.sessionId}`);
    const iceCredential = await this.iceApiService.getIceCredential();
    this.loggerService.debug(`ICE credential: ${JSON.stringify(iceCredential)}`);
    const peer = new Peer(this.rtcConfig, iceCredential);
    peer.addListener('error', (error) => this.loggerService.error(`Peer Error: ${error}`));
    peer.addListener('debug', (name: string, event: any) => this.loggerService.debug(`Debug event "${name}": ${JSON.stringify(event)}`));
    this.loggerService.debug(`Peer: ${JSON.stringify(peer)}`);
    try {
      // Accept call.
      this.signallingChannel.sendAnswer(true, offer.sessionId);
      this.loggerService.debug(`Answer sent, Peer: ${JSON.stringify(peer)}`);
      try {
        // Connect to peer and wait until connection is established.
        await peer.answerCall(
          offer.sessionId,
          offer.socketId,
          offer.userId,
          this.signallingChannel,
        );
        this.loggerService.debug(`Call answered, Peer: ${JSON.stringify(peer)}`);
        peer.addListener('channelRequest', async (ev: ChannelRequestEvent) => {
          this.loggerService.debug(`Received request for channel of type ${ev.type} from user ${offer.userId} in session with ID ${offer.sessionId}`);
          try {
            const ch = ev.accept();
            const addChannel = () => {
              this.addChannel(ch);
              this.loggerService.debug(`Channel added`);//, Peer: ${JSON.stringify(peer)}`);
            }
            // Add channel, if already opened.
            if (ch.state === 'open') {
              this.loggerService.debug(`Channel of type ${ev.type} from user ${offer.userId} in session with ID ${offer.sessionId} is already open`);
              addChannel();
            }
            // Handle connects and disconnects.
            ch.addListener('connected', () => {
              this.loggerService.debug(`Channel of type ${ev.type} from user ${offer.userId} in session with ID ${offer.sessionId} is now connected`);
              addChannel();
            });
            ch.addListener('closed', () => {
              this.loggerService.debug(`Channel of type ${ev.type} from user ${offer.userId} in session with ID ${offer.sessionId} is now closed`);
              this.removeChannel(ch);
            });
          } catch (error) {
            this.loggerService.error(`Failed to answer call: ${error}`, this.constructor.name);
          }
        });
        peer.addListener('closed', () => {
          this.loggerService.debug(`Channel to user ${offer.userId} in session with ID ${offer.sessionId} is now closed`);
          // Remove peer.
          const index = this.peers.indexOf(peer);
          this.peers.splice(index, 1);
        });
        // Add peer.
        this.peers.push(peer);
      } catch (error) {
        this.loggerService.error(`failed to accept call: ${error}`, this.constructor.name);
      }
    } catch (error) {
      this.loggerService.error(`Failed to handle call offer: ${error}`, this.constructor.name);
      // Decline call and close connection.
      this.signallingChannel.sendAnswer(false, offer.sessionId);
      peer.close(this.signallingChannel);
    }
  };

  /**
   * Constructs a new RTC Sender Service.
   * @param authService Instance of Auth Service.
   * @param rtcConfig Instance of RTC Configuration.
   * @param iceApiService Instance of ICE API Service.
   * @param loggerService Instance of Logger Service.
   */
  constructor(
    private readonly authService: AuthService,
    private readonly rtcConfig: RtcConfig,
    private readonly iceApiService: IceApiService,
    private readonly loggerService: LoggerService
  ) {}

  /**
   * Adds a channel.
   * @param channel Channel to add.
   */
  private addChannel(channel: TxChannel): void {
    this.broadcast(
      {
        active: true,
        type: channel.type,
        userId: channel.userId,
      },
      ChannelType.monitoring,
    );
    this.getChannels(channel.type).push(channel);
    if (channel.type === ChannelType.monitoring) {
      const allChannelTypes = [
        ChannelType.ecg,
        ChannelType.eda,
        ChannelType.eyetracking,
        ChannelType.monitoring,
        ChannelType.movement,
      ];
      const chs: TxChannel[] = [];
      allChannelTypes.forEach(t => chs.push(...this.getChannels(t)));
      const data = chs.map(ch => ({
        active: true,
        type: ch.type,
        userId: ch.userId,
      }));
      data.forEach(d => channel.send(d));
    }
    this.eventEmitter.emit('channel', channel);
  }

  /**
   * Adds an event listener.
   * @param event Name of event.
   * @param listener Listener callback.
   */
  addListener(
    event: RtcSenderServiceEvent,
    listener: (...args: any[]) => void,
  ): void {
    this.eventEmitter.addListener(event, listener);
  }

  /**
   * Sends the same data to all channels of a specific type.
   * @param data Data to send.
   * @param type Type of channels.
   */
  broadcast(data: SensorData | MonitoringData, type: ChannelType): void {
    const channels = this.getChannels(type);
    channels.forEach(ch => {
      ch.send(data);
    });
  }

  /**
   * Connects to the signalling server.
   */
  async connect(): Promise<void> {
    try {
      const credential = await this.iceApiService.getIceCredential();
      this.signallingChannel = await SignallingChannel.connectAndRegisterOauth(
        this.rtcConfig.signallingServerUrl,
        this.rtcConfig.mode,
        this.authService.accessToken,
        credential,
        5000,
        5000,
        1,
        3000,
      );
      this.signallingChannel.addListener('calloffer', this.onCallOffer);
      this.loggerService.log(`Connected to Signalling Server`, this.constructor.name);
    } catch (error) {
      this.loggerService.error(`Failed to connect to Signalling Server ${this.rtcConfig.signallingServerUrl}: ${JSON.stringify(error)}`, this.constructor.name);
    }
  }

  /**
   * Disconnects from signalling server.
   */
  disconnect(): void {
    this.signallingChannel.close();
    this.signallingChannel.removeListener('calloffer', this.onCallOffer);
  }

  /**
   * Gets all channels of a specific type.
   * @param type Type of channel.
   * @returns Channels of specified type.
   */
  private getChannels(type: ChannelType): TxChannel[] {
    return this.channels[type.toString()];
  }

  /**
   * Removes a channel.
   * @param channel Channel to remove.
   */
  private removeChannel(channel: TxChannel): void {
    const channels = this.getChannels(channel.type);
    const index = channels.indexOf(channel);
    channels.splice(index, 1);
    this.broadcast(
      {
        active: false,
        type: channel.type,
        userId: channel.userId,
      },
      ChannelType.monitoring,
    );
  }

  /**
   * Removes an event listener.
   * @param event Name of event.
   * @param listener Listener callback.
   */
  removeListener(
    event: RtcSenderServiceEvent,
    listener: (args: any[]) => void,
  ): void {
    this.eventEmitter.removeListener(event, listener);
  }
}
