import { LoggerService } from '@libs/logger';
import { EventManager } from '@libs/sensor-api/types/event-manager.class';
import { Injectable } from '@nestjs/common';

import { LocalPeerService } from '../local-peer/local-peer.service';

@Injectable()
export class CommunicationService {
  private readonly events = new EventManager();

  /**
   * Constructs a new communication service.
   * @param localPeerService Local peer service instance.
   * @param loggerService Logger service instance.
   */
  constructor(
    readonly localPeerService: LocalPeerService,
    private readonly loggerService: LoggerService,
  ) {
    const onConnect = (peer: RTCPeerConnection) => {
      this.loggerService.verbose('Peer connected', this.constructor.name);
      const stateChange = () => {
        if (peer.connectionState === 'closed') {
          peer.removeEventListener('connectionstatechange', stateChange);
        }
      };
      peer.addEventListener('connectionstatechange', stateChange);
    };
    this.localPeerService.addListener('peer', onConnect);
    this.localPeerService.addListener('channel', (channel: RTCDataChannel) => {
      this.events.fire('connected', channel);
    });
  }

  on(event: 'connected', listener: (channel: RTCDataChannel) => void | Promise<void>) {
    this.events.on(event, listener);
  }
  off(event: 'connected', listener: (channel: RTCDataChannel) => void | Promise<void>) {
    this.events.off(event, listener);
  }

  /**
   * Gets, if a track with a specific identity exists.
   * @param id Identity of track.
   * @returns true = exists, false = not exists.
   */
  existsTrack(id: string): boolean {
    return this.localPeerService.existsTrack(id);
  }

  /**
   * Gets a peer connection by ID.
   * @param id Identity of peer to get.
   * @returns Peer connection with matching identity or undefined if not found.
   */
  getPeerConnection(id: string): RTCPeerConnection | undefined {
    return this.localPeerService.getLocalPeer(id);
  }

  /**
   * Gets a track by its identity.
   * @param id Identity of track.
   * @returns Track with matching identity or undefined if not found.
   */
  getTrack(id: string): MediaStreamTrack | undefined {
    return this.localPeerService.getTrackById(id);
  }

  /**
   * Sends a message to the "com" channel.
   * @param message Message to send.
   */
  sendMessage(message: string): void {
    this.localPeerService.send(message, 'com');
  }

  /**
   * Gets, if a channel with a specific identity exists.
   * @param id Identity of channel.
   * @returns true = exists, false = not exists.
   */
  existsChannelWithId(id: string): boolean {
    return this.localPeerService.existsChannelWithId(id);
  }

  /**
   * Gets, if a channel with a specific label exists.
   * @param label Label of the channel.
   * @returns true = exists, false = not exists.
   */
  existsChannelWithLabel(label: string): boolean {
    return this.localPeerService.existsChannelWithLabel(label);
  }

  /**
   * Gets a channel by its identity.
   * @param id Identity of channel.
   * @returns Channel with matching identity or undefined if not found.
   */
  getChannelById(id: string): RTCDataChannel | undefined {
    return this.localPeerService.getChannelById(id);
  }

  /**
   * Gets a channel by its label.
   * @param label Label of the channel.
   * @returns Channel with matching identity or undefined if not found.
   */
  getChannelsByLabel(label: string): RTCDataChannel[] | undefined {
    return this.localPeerService.getChannelsByLabel(label);
  }
}
