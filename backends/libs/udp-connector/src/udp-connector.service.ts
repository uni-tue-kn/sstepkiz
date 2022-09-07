import { LoggerService } from '@libs/logger';
import { Injectable } from '@nestjs/common';
import dgram from 'dgram';

import { UdpChannelConfig } from './udp-channel-config.interface';

@Injectable()
export class UdpConnectorService {
  /**
   * Mapping of channels to listeners.
   */
  private readonly listeners: {
    [channel: string]: ((msg: Buffer) => void | Promise<void>)[];
  } = {};

  /**
   * All existing (and maybe running) UDP socket instances.
   */
  private readonly sockets: { [name: string]: dgram.Socket } = {};

  constructor(private readonly loggerService: LoggerService) {}

  /**
   * Closes a server.
   * @param socket Server instance to close.
   */
  private closeChannel(socket: dgram.Socket): void {
    socket.close();
  }

  /**
   * Emits a message to all listeners on the specified channel.
   * @param channel Name of channel to emit the message.
   * @param msg Message to emit.
   */
  private async emit(channel: string, msg: Buffer): Promise<void> {
    // Ensure, that a listener is active on the channel.
    if (!(channel in this.listeners)) {
      return;
    }

    // Call every listener callback of the channel.
    await Promise.all(
      this.listeners[channel].map(l => {
        return new Promise<void>(async resolve => {
          try {
            l(msg);
            resolve();
          } catch {
            resolve();
          }
        })
      })
    );
  }

  /**
   * Removes a listener callback from a channel.
   * @param channel Name of channel to remove the listener from.
   * @param listener Listener callback to remove.
   */
  off(channel: string, listener: (msg: Buffer) => void | Promise<void>): void {
    // Ensure that channel exists.
    if (!(channel in this.listeners)) {
      return;
    }

    // Remove listener from array of callback methods for the channel.
    const index = this.listeners[channel].indexOf(listener);
    if (index < 0) {
      return;
    }
    this.listeners[channel].splice(index, 1);

    // Close channel and remove array of callback methods, if empty.
    if (this.listeners[channel].length === 0) {
      this.closeChannel(this.sockets[channel]);
      delete this.listeners[channel];
    }
  }

  /**
   * Adds a listener callback to a channel.
   * @param channel Name of channel to add the listener to.
   * @param listener Listener callback to add.
   */
  async on(channel: UdpChannelConfig, listener: (msg: Buffer) => void | Promise<void>): Promise<void> {
    // Open channel if not yet done.
    if (!this.sockets[channel.name]) {
      await this.openChannel(channel);
    }

    // Create array of callback methods for the channel if not yet done.
    if (!this.listeners[channel.name]) {
      this.listeners[channel.name] = [];
    }

    // Add listener to array of callback methods for the channel.
    this.listeners[channel.name].push(listener);
  }

  private onClose(socket: dgram.Socket, channel: string): void {
    this.loggerService.debug(
      `Socket of channel ${channel} was closed.`,
      this.constructor.name,
    );
  }

  private onConnect(socket: dgram.Socket, channel: string): void {
    this.loggerService.debug(
      `Socket of channel ${channel} was connected.`,
      this.constructor.name,
    );
  }

  private onError(error: Error, socket: dgram.Socket, channel: string): void {
    this.loggerService.error(
      `Error with socket of channel ${channel}: "${error.message}`,
      this.constructor.name,
    );
  }

  private onListening(socket: dgram.Socket, channel: string): void {
    this.loggerService.debug(
      `Listening to socket of channel ${channel}.`,
      this.constructor.name,
    );
  }

  /**
   * Handles received UDP messages from all sockets.
   * @param msg Received message.
   * @param rinfo Information about the sender.
   * @param socket Socket who received the message.
   * @param channel Name of channel.
   */
  private onMessage(
    msg: Buffer,
    rinfo: dgram.RemoteInfo,
    socket: dgram.Socket,
    channel: string,
  ): void {
    // this.loggerService.debug(
    //   `Message received on socket of channel ${channel}.`,
    //   this.constructor.name,
    // );
    this.emit(channel, msg);
  }

  /**
   * Opens a channel.
   * @param channel Specification of channel to open.
   * @returns Instance of channel's socket.
   */
  private openChannel(channel: UdpChannelConfig): Promise<dgram.Socket> {
    return new Promise<dgram.Socket>((resolve, reject) => {
      this.loggerService.debug(
        `Opening UDP channel ${channel.name}...`,
        this.constructor.name,
      );
      // Ensure that a channel with the name does not exist yet.
      if (this.sockets[channel.name]) {
        reject(`A socket for channel '${channel.name}' already exists`);
      }

      // Prepare callback methods.
      const onConnect = () => {
        this.onConnect(this.sockets[channel.name], channel.name);
      };
      const onError = (error: Error) => {
        this.onError(error, this.sockets[channel.name], channel.name);
        this.sockets[channel.name].close();
        reject('Failed to start server: ' + error.message);
      };
      const onListening = () => {
        this.onListening(this.sockets[channel.name], channel.name);
      };
      const onMessage = (msg: Buffer, rinfo: dgram.RemoteInfo) => {
        this.onMessage(msg, rinfo, this.sockets[channel.name], channel.name);
      };
      const onClose = () => {
        this.onClose(this.sockets[channel.name], channel.name);

        // Stop listening to callbacks.
        this.sockets[channel.name].off('close', onClose);
        this.sockets[channel.name].off('connect', onConnect);
        this.sockets[channel.name].off('error', onError);
        this.sockets[channel.name].off('listening', onListening);
        this.sockets[channel.name].off('message', onMessage);

        // Delete socket instance.
        delete this.sockets[channel.name];
      };

      // Create the socket.
      this.sockets[channel.name] = dgram.createSocket(
        channel.ipType,
        onMessage,
      );

      // Start listening to callbacks.
      this.sockets[channel.name].on('close', onClose);
      this.sockets[channel.name].on('connect', onConnect);
      this.sockets[channel.name].on('error', onError);
      this.sockets[channel.name].on('listening', onListening);
      this.sockets[channel.name].on('message', onMessage);

      // Bind socket to endpoint and resolve when done.
      try {
        this.sockets[channel.name].bind(channel.port, channel.host, () => {
          this.loggerService.debug(
            `UDP channel ${channel.name} was opened`,
            this.constructor.name,
          );
          resolve(this.sockets[channel.name]);
        });
      } catch (error) {
        reject(`Failed to bind new UDP socket of channel "${channel.name}": ${error}`);
      }
    });
  }
}
