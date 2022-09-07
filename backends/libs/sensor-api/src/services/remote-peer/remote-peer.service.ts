import { ChannelDescription, RemotePeer, RemotePeerConfiguration } from '@libs/sensor-api/types/remote-peer.class';
import { Injectable } from '@nestjs/common';

export interface PeerConnectOptions {
  initChannels?: ChannelDescription[];
  config: RemotePeerConfiguration;
}

@Injectable()
export class RemotePeerService {
  /**
   * List of active peers.
   */
  private readonly _activePeers: RemotePeer[] = [];
  /**
   * Gets all active peers.
   * Contains peers which are either connected or (re)connecting.
   */
  get activePeers(): RemotePeer[] {
    return [...this._activePeers];
  }

  /**
   * List of connected peers.
   */
  private _connectedPeers: RemotePeer[];
  /**
   * Gets all connected peers.
   * Contains only peers which are currently connected.
   */
  get connectedPeers(): RemotePeer[] {
    return [...this._connectedPeers];
  }

  /**
   * Connects to a remote peer.
   * @param options Remote Peer connect options.
   * @param channels Resulting initial Data Channels, RTP Transceivers, or RTP Senders if requested in options.
   * @returns Resulting connected Remote Peer Instance.
   */
  async connect(options: PeerConnectOptions, channels?: (RTCDataChannel | RTCRtpTransceiver | RTCRtpSender)[]): Promise<RemotePeer> {
    // Create new remote peer instance.
    const p = new RemotePeer(options.config);
    // Remove from active peers when ended.
    p.on('end', () => {
      // Find index.
      const index = this._activePeers.indexOf(p);
      // Remove from active peers if in active peers.
      if (index >= 0) {
        this._activePeers.splice(index, 1);
      }
    });
    try {
      let result = undefined;
      while (!result) {
        try {
          // Connect the peer.
          result = await p.open(...options?.initChannels);
        } catch (error) {
          result = undefined;
        }
      }
      // Add new peer to active peers.
      this._activePeers.push(p);
      // If given, add initial Data Channels and RTP Receivers to channels.
      if (channels) {
        channels.push(...result);
      }
      // Return the RTC Peer Connection.
      return p;
    } catch (error) {
      throw error;
    }
  }
}
