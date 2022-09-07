import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'projects/aggregator-ui/src/environments/environment';

/**
 * Manages RTC Peer Connection to Aggregator Server.
 */
@Injectable({ providedIn: 'root' })
export class RtcDataService {

  /**
   * Mapping of labels to active RTC Data Channels.
   */
  private readonly activeDataChannels: { [label: string]: RTCDataChannel } = {};

  /**
   * Gets an array of labels of available RTC Data Channels.
   */
  get channels(): string[] {
    return Object.getOwnPropertyNames(this.dataChannels);
  }

  /**
   * Gets if peer is connected to Aggregator Server.
   */
  get connected(): boolean {
    return this.peer?.connectionState === 'connected' ?? false;
  }

  /**
   * Mapping of labels to RTC Data Channels.
   */
  private readonly dataChannels: { [label: string]: RTCDataChannel } = {};

  /**
   * UUID of local Peer Connection.
   */
  private id?: string = undefined;

  /**
   * Mapping of labels to Media Stream Tracks.
   */
  private readonly mediaStreamTracks: { [label: string]: MediaStreamTrack } = {};

  /**
   * RTC Peer Connection to Aggregator Server.
   */
  private peer?: RTCPeerConnection;

  constructor(private readonly http: HttpClient) { }

  /**
   * Requests a new RTC Peer Connection ID from server.
   * @returns RTC Peer Connection ID.
   */
  private async requestConnection(): Promise<string> {
    try {
      const result = await this.http.post<{ id: string }>(`${environment.urls.aggregatorBackend}/rtc`, undefined).toPromise();
      return result.id;
    } catch (error) {
      throw `Requesting peer connection from Aggregator Server failed: ${JSON.stringify(error)}`;
    }
  }

  /**
   * Creates a new RTC Data Channel.
   * @param label Label of new channel.
   * @param options RTC Data Channel options.
   * @returns Created RTC Data Channel instance.
   * @throws If channel of label already exists.
   */
  private createChannel(label: string, options?: RTCDataChannelInit): RTCDataChannel {
    // Ensure that channel of equal label does not yet exist.
    if (label in this.dataChannels) {
      throw `RTC Data Channel of label '${label}' already exists!`;
    }

    // Create new Data Channel instance.
    const channel = this.peer.createDataChannel(label, options);

    // Prepare event callbacks.
    const onClose = (ev: Event) => {
      console.log(`Data Channel ${label} was closed:`, ev, channel);
      // Remove channel from data channels.
      delete this.dataChannels[label];
      // Remove channel from active data channels.
      delete this.activeDataChannels[label];

      // Unsubscribe events.
      channel.removeEventListener('close', onClose);
      channel.removeEventListener('error', onError);
      channel.removeEventListener('message', onMessage);
      channel.removeEventListener('open', onOpen);
    };
    const onError = (ev: RTCErrorEvent) => {
      console.log(`Data Channel ${label} received error:`, ev, channel);
    };
    const onMessage = (ev: MessageEvent<string>) => {
      console.log(`Data Channel ${label} received message:`, ev, channel);
    };
    const onOpen = (ev: Event) => {
      console.log(`Data Channel ${label} was opened:`, ev, channel);
      // Add channel to active data channels.
      this.activeDataChannels[label] = channel;
    };
    // Subscribe events.
    channel.addEventListener('close', onClose);
    channel.addEventListener('error', onError);
    channel.addEventListener('message', onMessage);
    channel.addEventListener('open', onOpen);

    // Add channel to data channels.
    this.dataChannels[label] = channel;

    // Return the created RTC Data Channel instance.
    return channel;
  }

  /**
   * Creates a new COM Channel.
   * @returns Created COM channel instance.
   * @throws If COM channel already exists.
   */
  private createComChannel(): RTCDataChannel {
    return this.createChannel('com', {
      ordered: true,
      maxRetransmits: 100,
    });
  }

  /**
   * Waits until a channel is open.
   * @param channel Channel to wait for open.
   * @returns Opened channel.
   * @throws If opening channel fails.
   */
  async openChannel(channel: RTCDataChannel): Promise<RTCDataChannel> {
    // Ensure that data channel is not yet open.
    if (channel.readyState === 'open') {
      return channel;
    }
    return await new Promise<RTCDataChannel>((resolve, reject) => {
      // Prepare callbacks.
      const onClose = () => {
        unsubscribe();
      };
      const onError = (ev: RTCErrorEvent) => {
        unsubscribe();
        reject(ev.error);
      };
      const onOpen = () => {
        unsubscribe();
        resolve(channel);
      };
      // Prepare method to unsubscribe events.
      const unsubscribe = () => {
        channel.removeEventListener('close', onClose);
        channel.removeEventListener('error', onError);
        channel.removeEventListener('open', onOpen);
      };
      // Subscribe events.
      channel.addEventListener('close', onClose);
      channel.addEventListener('error', onError);
      channel.addEventListener('open', onOpen);
    });
  }

  async open(configuration?: RTCConfiguration) {
    // Ensure that RTC Peer Connection is not yet open.
    if (this.peer) {
      throw `RTC Peer Connection already exists!`;
    }

    try {
      // Create new RTC Peer Connection instance.
      this.peer = new RTCPeerConnection(configuration);

      // Add listener for general output
      this.peer.addEventListener('connectionstatechange', () => {
        console.log('Connection state changed to: ', this.peer.connectionState);
        switch (this.peer.connectionState) {
          case 'closed':
            // Unsubscribe from events.
            this.peer.removeEventListener('negotiationneeded', onNegotiationNeeded);
            break;
        }
      });
      this.peer.addEventListener('icegatheringstatechange', () => {
        console.log('ICE gathering state', this.peer.iceGatheringState);
      });
      this.peer.addEventListener('iceconnectionstatechange', () => {
        console.log('ICE connection state changed', this.peer.iceConnectionState);
      });
      this.peer.addEventListener('signalingstatechange', () => {
        console.log('Signaling state changed to: ', this.peer.signalingState);
      });
      this.peer.addEventListener('datachannel', (e) => {
        console.log('Received new data channel: ', e);
        this.dataChannels[e.channel.label]
      });

      // Create COM channel.
      this.createComChannel();

      // Request RTC Peer Connection ID if not yet requested.
      if (!this.id) {
        this.id = await this.requestConnection();
      }

      // Start to negotiate when negotiation needed.
      const onNegotiationNeeded = (ev: Event) => {
        console.log('Negotiation needed', this.peer, ev);
        this.negotiate(this.id);
      };
      this.peer.addEventListener('negotiationneeded', onNegotiationNeeded);

      // Negotiate the RTC Peer Connection.
      await this.negotiate(this.id);
    } catch (error) {
      throw `Failed to open RTC Peer Connection: ${JSON.stringify(error)}`;
    }
  }

  reset(resetId: boolean = false) {
    this.peer?.close();
    this.peer = undefined;
    if (resetId) {
      this.id = undefined;
    }
  }

  /**
   * Negotiates the connection to remote peer.
   * @param id UUID of peer connection.
   */
  async negotiate(id: string): Promise<void> {
    try {
      // Generate local session description.
      const localDescription = await this.createOffer();
      await this.setLocalDescription(localDescription);
      const remoteDescription = await this.sendOffer(id, localDescription);
      await this.peer.setRemoteDescription(remoteDescription);
    } catch (error) {
      throw `Failed to negotiate peer connection to Aggregator Server: ${error}`;
    }
  }

  /**
   * Sends a Session description to the backend rtc peer and returns the remote description
   * @param id Rtc peer id
   * @param offer Session description
   * @returns Remote description
   */
  async sendOffer(id: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    const url = `${environment.urls.aggregatorBackend}/rtc/${id}/offer`;
    try {
      return (await this.http.put(url, offer).toPromise()) as RTCSessionDescriptionInit;
    } catch (error) {
      throw `Failed to send Session Description offer ${JSON.stringify(offer)} to ${url}: ${JSON.stringify(error)}`;
    }
  }

  private async createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit> {
    try {
      return await this.peer.createOffer(options);
    } catch (error) {
      throw `Failed to create local session description offer: ${JSON.stringify(error)}`;
    }
  }
  private async setLocalDescription(description: RTCSessionDescriptionInit): Promise<void> {
    try {
      await this.peer.setLocalDescription(description);
    } catch (error) {
      throw `Failed to set local description of ${JSON.stringify(description)}: ${JSON.stringify(error)}`;
    }
  }

  /** Checks wether or not a channel with a label exists and can be used (e.g. is open) 
   * @param label       Label of the channel
   * @returns           Wether or not the channel can be used
   */
  public hasDataChannel(label: string): boolean {
    return label in this.dataChannels;
  }

  /**
   * Adds a track to the peer connection
   * @param track       Track to add
   * @returns           Id of the added track
   */
  addTrack(track: MediaStreamTrack): string {
    this.peer.addTrack(track);
    return track.id;
  }

  /**
   * Gets a Data Channel reference by label.
   * @param label       Label of the channel
   * @returns           (Existing) RTCDataChannel with the label
   */
   public getChannel(label: string): RTCDataChannel | undefined {
    if (label in this.dataChannels) {
      return this.dataChannels[label];
    } else {
      return undefined;
    }
  }
}
