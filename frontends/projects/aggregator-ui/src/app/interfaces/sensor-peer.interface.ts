import { eventToPromise } from './sensor-to-promise.function';

export class SensorPeerInterface {

  /**
   * Mapping of labels to data channels.
   * Used labels do not contain the sensor identity prefix!
   */
  private readonly channels: { [label: string]: RTCDataChannel } = {};

  /**
   * Mapping of labels to tracks.
   * Used labels match the labels of the track.
   */
  private readonly tracks: { [label: string]: MediaStreamTrack } = {};

  /**
   * Constructs a new interface for sensors to communicate to the Aggregator Server.
   * @param sensorId Sensor identity.
   * @param peer Instance of used peer connection.
   * @throws When sensor identity or peer connection are invalid or not connected.
   */
  constructor(
    readonly sensorId: string,
    private readonly peer: RTCPeerConnection
  ) {
    // Validate sensor identity.
    if (!this.sensorId) {
      throw `'sensorId' is invalid!`;
    }
    // Validate peer connection.
    if (this.peer?.connectionState === 'closed' ?? true) {
      throw `'peer' is either undefined has an invalid connection state!`;
    }

    // Prepare callback methods.
    const onConnectionStateChange = (ev: Event) => {
      if (this.peer.connectionState === 'closed') {
        // Unsubscribe events.
        this.peer.removeEventListener('connectionstatechange', onConnectionStateChange);
        this.peer.removeEventListener('datachannel', onDataChannel);
        this.peer.removeEventListener('track', onTrack);
      }
    }
    const onDataChannel = (ev: RTCDataChannelEvent) => {
      const prefix = `${sensorId}_`;
      // Ensure that data channel's label matches the prefix.
      if (ev?.channel?.label?.startsWith(prefix) ?? false) {
        // Extract the label and the data channel.
        const label = ev.channel.label.substring(prefix.length);
        const channel = ev.channel;
        // Add data channel to mapping of labels to data channel.
        this.channels[label] = channel;
        // Delete data channel from mapping of labels to data channel when closed.
        eventToPromise(channel, 'close').then(() => {
          delete this.channels[label];
        });
      }
    };
    const onTrack = (ev: RTCTrackEvent) => {
      // Ensure that track's label is valid.
      if (ev?.track?.label ?? false) {
        // Extract the label and the track.
        const label = ev.track.label;
        const track = ev.track;
        // Add track to mapping of labels to tracks.
        this.tracks[label] = track;
        // Delete track from mapping of labels to tracks when ended.
        if (ev?.transceiver?.sender?.transport ?? false) {
          eventToPromise<Event>(
            ev.transceiver.sender.transport, 'statechange',
            () => ev.transceiver.sender.transport.state === 'closed'
          ).then(() => {
            delete this.tracks[label];
          });
        }
        if (ev?.transceiver?.receiver?.transport ?? false) {
          eventToPromise<Event>(
            ev.transceiver.receiver.transport, 'statechange',
            () => ev.transceiver.receiver.transport.state === 'closed'
          ).then(() => {
            delete this.tracks[label];
          });
        }
      }
    };
    // Subscribe events.
    this.peer.addEventListener('connectionstatechange', onConnectionStateChange);
    this.peer.addEventListener('datachannel', onDataChannel);
    this.peer.addEventListener('track', onTrack);
  }

  addTransceiver(kind: 'audio' | 'video', options: RTCRtpTransceiverInit): RTCRtpTransceiver {
    return this.peer.addTransceiver(kind, options);
  }

  /**
   * Adds a track.
   * @param track Track to add.
   * @returns RTP sender which sends the track.
   * @throws When adding track failed.
   */
  addTrack(track: MediaStreamTrack): RTCRtpSender {
    const sender = this.peer.addTrack(track);
    if (sender.transport.state === 'closed')
    eventToPromise(track, 'ended')
    return sender;
  }
  /**
   * Gets a track by its label.
   * If the track does not exist, this method will wait until track was added.
   * @param label Label of track to get.
   * @returns Requested track.
   */
  async getTrack(label: string): Promise<MediaStreamTrack> {
    if (this.hasTrack(label)) {
      // Track exists -> Return track.
      return this.tracks[label];
    } else {
      // Track does not exist -> Return promise which awaits track.
      return await eventToPromise<RTCTrackEvent>(
        this.peer, 'track',
        (ev) => {
          console.log('received track', ev.track);
          // Verify that track's label matches the requested label.
          return ev?.track?.label === label ?? false;
        }
      ).then((ev) => ev.track);
    }
  }
  /**
   * Checks if a track of a specific label already exists.
   * @param label Label of track to check.
   * @returns true = exists, false = not exists.
   */
  hasTrack(label: string): boolean {
    return label in this.tracks;
  }

  /**
   * Creates a new data channel.
   * @param label Label of new data channel.
   * @param configuration Configuration of new data channel.
   * @returns Created data channel.
   */
  createChannel(label: string, configuration?: RTCDataChannelInit): RTCDataChannel {
    return this.peer.createDataChannel(label, configuration);
  }
  /**
   * Gets a data channel by its label.
   * If the data channel not exists, this method will wait until data channel was added.
   * @param label Label of data channel to get.
   * @returns Requested data channel.
   */
  async getChannel(label: string): Promise<RTCDataChannel> {
    if (this.hasChannel(label)) {
      // Data channel exists -> Return data channel.
      return this.channels[label];
    } else {
      // Data channel does not exist -> Return promise which awaits the data channel.
      return await eventToPromise<RTCDataChannelEvent>(
        this.peer, 'datachannel',
        (ev) => {
          // Verify that data channel's label matches the requested label with sensor identity prefix.
          return ev?.channel?.label === `${this.sensorId}_${label}` ?? false;
        }
      ).then((ev) => ev.channel);
    }
  }
  /**
   * Checks if a data channel of a specific label already exists.
   * @param label Label of data channel to get.
   */
  hasChannel(label: string): boolean {
    return label in this.channels;
  }
}
