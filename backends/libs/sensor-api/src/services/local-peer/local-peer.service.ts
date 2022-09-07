import { LoggerService } from '@libs/logger';
import { Injectable } from '@nestjs/common';
import { EventEmitter } from '../../../../../../shared/dist';
import { v4 as uuid4 } from 'uuid';
import { createCanvas } from 'canvas';
import { RTCPeerConnection, MediaStreamTrack } from 'wrtc';
import { DriverService } from '../driver/driver.service';
const { RTCVideoSink, RTCVideoSource, rgbaToI420 } = require('wrtc').nonstandard;

const PLACEHOLDER_WIDTH = 640;
const PLACEHOLDER_HEIGHT = 480;
const PLACEHOLDER_FPS = 30;

/**
 * Service that handles the peer connections to the local client (Aggregator UI).
 */
@Injectable()
export class LocalPeerService {

  /**
   * Maps IDs to channels.
   */
  private readonly channelsByIDs: { [id: string]: RTCDataChannel } = {};

  /**
   * Maps labels to channels with that label.
   */
  private readonly channelsByLabels: { [label: string]: RTCDataChannel[] } = {};

  /**
   * Event emitter.
   */
  private readonly eventEmitter: EventEmitter = new EventEmitter();

  /**
   * Maps IDs to local peers.
   */
  private readonly peers: { [id: string]: RTCPeerConnection } = {};

  /**
   * Maps IDs to tracks.
   */
  private readonly tracks: { [id: string]: MediaStreamTrack } = {};

  /**
   * Constructs a new local peer service.
   * @param loggerService Logger Service instance.
   * @param driverService Driver Service instance.
   */
  constructor(
    private readonly loggerService: LoggerService,
    private readonly driverService: DriverService
  ) {}

  /**
   * Adds an event listener.
   * @param event Name of event.
   * @param listener Listener callback.
   */
  addListener(
    event: 'peer' | 'channel' | 'data',
    listener: (...args: any[]) => void,
  ): void {
    this.eventEmitter.addListener(event, listener);
  }

  /**
   * Gets if a channel with a specific identity exists.
   * @param id Identity of channel.
   * @returns true = exists, false = not exists.
   */
  existsChannelWithId(id: string): boolean {
    return !!this.channelsByIDs[id];
  }

  /**
   * Gets if a channel with a specific label exists.
   * @param label Label of channel.
   * @returns true = exists, false = not exists.
   */
  existsChannelWithLabel(label: string): boolean {
    const channels = this.channelsByLabels[label];
    return !!channels && channels.length > 0;
  }

  /**
   * Gets if a peer with a specific identity exists.
   * @param id Identity of local peer.
   * @returns true = exists, false = not exists.
   */
  existsPeer(id: string): boolean {
    return !!this.peers[id];
  }

  /**
   * Gets if a track with a specific identity exists.
   * @param id Identity of track.
   * @returns true = exists, false = not exists.
   */
  existsTrack(id: string): boolean {
    return !!this.tracks[id];
  }

  /**
   * Gets a channel by its identity.
   * @param id Identity of channel.
   * @returns Matching channel or undefined if no channel matches.
   */
  getChannelById(id: string): RTCDataChannel | undefined {
    return this.channelsByIDs[id];
  }

  /**
   * Gets an array of channels by their label.
   * @param label Label of channels.
   * @returns Array of matching channels.
   */
  getChannelsByLabel(label: string): RTCDataChannel[] {
    return this.channelsByLabels[label] || [];
  }

  /**
   * Gets a local peer by its identity.
   * @param id Identity of local peer.
   * @returns Matching local peer or undefined if no local peer matches.
   */
  getLocalPeer(id: string): RTCPeerConnection | undefined {
    return this.peers[id];
  }

  /**
   * Gets a track by its identity.
   * @param id Identity of track.
   * @returns Matching track or undefined if no track matches.
   */
  getTrackById(id: string): MediaStreamTrack | undefined {
    return this.tracks[id];
  }

  /**
   * Opens a new peer and returns its ID.
   * @returns Identity of peer.
   */
  openNewPeer(): string {
    const id = uuid4();
    this.loggerService.verbose(
      `Creating new local peer with ID "${id}"...`,
      this.constructor.name,
    );
    const peer = new RTCPeerConnection();
    peer.addEventListener('iceconnectionstatechange', () => {
      this.loggerService.verbose(
        `ICE connection state of local peer with ID "${id}" changed to "${peer.iceConnectionState}"`,
        this.constructor.name,
      );
    });
    peer.addEventListener('icegatheringstatechange', () => {
      this.loggerService.verbose(
        `ICE gathering state of local peer with ID "${id}" changed to "${peer.iceGatheringState}"`,
        this.constructor.name,
      );
    });
    peer.addEventListener('datachannel', (ev: RTCDataChannelEvent) => {
      const channel = ev.channel;
      if (!channel) return;
      this.loggerService.verbose(
        `New data channel with label "${channel.label}" and ID "${channel.id}" to local peer with ID "${id}"`,
        this.constructor.name,
      );
      const onMessage = (e: MessageEvent) => {
        if (!e.data) return;
        this.loggerService.verbose(
          `Received data of data channel with label "${channel.label}" and ID "${channel.id}" to local peer with ID "${id}": "${e.data}"`,
          this.constructor.name,
        );
        this.eventEmitter.emit('data', {
          data: e.data,
          id,
          label: channel.label,
        });
      };
      const onOpen = () => {
        if (channel.label === 'com') {
          this.channelsByIDs[id] = channel;
        }
        if (!this.channelsByLabels[channel.label]) {
          this.channelsByLabels[channel.label] = [];
        }
        this.channelsByLabels[channel.label].push(channel);
        
        this.loggerService.verbose(
          `Data channel with label "${channel.label}" and ID "${channel.id}" to local peer with ID "${id}" is open`,
          this.constructor.name,
        );
        this.eventEmitter.emit('channel', channel);
      };
      const onClose = () => {
        delete this.channelsByIDs[id];
        const index = this.channelsByLabels[channel.label].indexOf(channel);
        this.channelsByLabels[channel.label].splice(index, 1);
        channel.removeEventListener('close', onClose);
        channel.removeEventListener('message', onMessage);
        channel.removeEventListener('open', onOpen);
        this.loggerService.verbose(
          `Data channel with label "${channel.label}" and ID "${channel.id}" to local peer with ID "${id}" is closed`,
          this.constructor.name,
        );
      };
      channel.addEventListener('open', onOpen);
      channel.addEventListener('close', onClose);
      channel.addEventListener('message', onMessage);
    });
    peer.addEventListener('connectionstatechange', () => {
      this.loggerService.verbose(
        `Connection state of peer with ID "${id}" changed to "${this.peers[id].connectionState}"`,
        this.constructor.name,
      );
      switch (this.peers[id].connectionState) {
        case 'connected':
          this.loggerService.verbose(
            `Connection to local peer with ID "${id}" is now open`,
            this.constructor.name,
          );
          this.eventEmitter.emit('peer', this.peers[id]);
          break;
        case 'closed':
          delete this.peers[id];
          this.loggerService.verbose(
            `Connection to local peer with ID "${id}" is now closed`,
            this.constructor.name,
          );
          break;
      }
    });
    peer.addEventListener('track', (ev: RTCTrackEvent) => {
      const track = ev.track;
      if (!track) return;
      this.tracks[track.id] = track;
      track.addEventListener('ended', () => {
        delete this.tracks[track.id];
        this.loggerService.verbose(
          `Track with ID "${track.id}" from local peer with ID "${id}" ended`,
          this.constructor.name,
        );
      });
      peer.addTrack(track);
      this.loggerService.verbose(
        `New track with ID "${track.id} from local peer with ID "${id}"`,
        this.constructor.name,
      );
      this.eventEmitter.emit('track', track);
    });
    const channels: {
      [sensorId: string]: {
        [label: string]: RTCDataChannel
      }
    } = {};
    const drivers = this.driverService.getDrivers();
    drivers.forEach(driver => {
      const dataChannelDescriptions = driver.channelDescriptions.dataChannels;
      const dataChannelLabels = Object.getOwnPropertyNames(dataChannelDescriptions);
      dataChannelLabels.forEach(label => {
        const dataChannel = peer.createDataChannel(`${driver.id}_${label}`, dataChannelDescriptions[label].configuration);
        const sendCallback = (data: string) => {
          dataChannel.send(data);
        };
        const onOpen = () => {
          dataChannel.removeEventListener('open', onOpen);
          if (!(driver.id in channels)) {
            channels[driver.id] = {};
          }
          channels[driver.id][label] = dataChannel;
          if (!dataChannelDescriptions[label].sendCallbacks) {
            dataChannelDescriptions[label].sendCallbacks = [];
          }
          dataChannelDescriptions[label].sendCallbacks.push(sendCallback);
          if (dataChannelDescriptions[label].onOpen) {
            try {
              dataChannelDescriptions[label].onOpen();
            } catch (error) {
              this.loggerService.error(`Failed to execute onOpen callback of sensor with identity ${driver.id}: \n${error}`, this.constructor.name);
            }
          };
        };
        const onClose = () => {
          dataChannel.removeEventListener('close', onClose);
          dataChannel.removeEventListener('message', onMessage);
          const index = dataChannelDescriptions[label].sendCallbacks.indexOf(sendCallback);
          if (index >= 0) {
            dataChannelDescriptions[label].sendCallbacks.splice(index, 1);
          }
          delete channels[driver.id][label];
          if (dataChannelDescriptions[label].onClose) {
            try {
              dataChannelDescriptions[label].onClose();
            } catch (error) {
              this.loggerService.error(`Failed to execute onClose callback of sensor with identity ${driver.id}:\n${JSON.stringify(error)}`, this.constructor.name);
            }
          }
        };
        const onMessage = async (ev: MessageEvent<string>) => {
          if (!ev?.data) return;
          if (dataChannelDescriptions[label].onData) {
            try {
              dataChannelDescriptions[label].onData(ev.data);
            } catch (error) {
              this.loggerService.error(`Failed to evaluate received message '${JSON.stringify(ev.data)}' from peer with identity '${id}' for driver with identity ${driver.id}:\n${error}`, this.constructor.name);
            }
          }
        };
        dataChannel.addEventListener('open', onOpen);
        dataChannel.addEventListener('close', onClose);
        dataChannel.addEventListener('message', onMessage);
      });
      if (driver.channelDescriptions.mediaChannels) {
        // Generate a placeholder stream for each media channel which streams a track when added.
        const mediaChannelDescriptions = driver.channelDescriptions.mediaChannels;
        const mediaChannelLabels = Object.getOwnPropertyNames(mediaChannelDescriptions);
        mediaChannelLabels.forEach(label => {
          // Get the description of the media channel.
          const description = mediaChannelDescriptions[label];

          if (!description.outputTrack) {
            // Generate track for media channel and add its RTP Sender to the description.
            const source = new RTCVideoSource();
            const track = source.createTrack();
            description.outputTrack = track;

            // Prepare track sink to handle new frames.
            let trackSink = undefined;
            // Prepare method to render a source track frame.
            const renderTrackFrame = ({ frame }) => {
              source.onFrame(frame);
            }

            // Create placeholder canvas.
            const placeholderCanvas = createCanvas(PLACEHOLDER_WIDTH, PLACEHOLDER_HEIGHT);
            const placeholderCtx = placeholderCanvas.getContext('2d');
            // Prepare other variables relevant for rendering of placeholder video track.
            let placeholderInterval: NodeJS.Timeout = undefined;
            let c = 0;
            // Prepare method to render a placeholder frame.
            const renderPlaceholderFrame = () => {
              // Render background.
              placeholderCtx.fillStyle = 'white';
              placeholderCtx.fillRect(0, 0, PLACEHOLDER_WIDTH, PLACEHOLDER_HEIGHT);
              // Render font in center.
              placeholderCtx.font = '48px Sans-serif';
              placeholderCtx.fillStyle = 'black';
              placeholderCtx.lineWidth = 1;
              placeholderCtx.textAlign = 'center';
              placeholderCtx.save();
              placeholderCtx.translate(PLACEHOLDER_WIDTH * 0.5, PLACEHOLDER_HEIGHT * 0.5);
              c = (c + 1) % 3;
              placeholderCtx.fillText(`Waiting for input ${['.  ', ' . ', '  .'][c]}`, 0, 0);
              placeholderCtx.restore();
              // Convert canvas to RGBA bitmap.
              const rgbaFrame = placeholderCtx.getImageData(0, 0, PLACEHOLDER_WIDTH, PLACEHOLDER_HEIGHT);
              // Convert RGBA bitmap to i420 frame.
              const i420Frame = {
                width: PLACEHOLDER_WIDTH,
                height: PLACEHOLDER_HEIGHT,
                data: new Uint8ClampedArray(1.5 * PLACEHOLDER_WIDTH * PLACEHOLDER_HEIGHT)
              };
              rgbaToI420(rgbaFrame, i420Frame);
              // Render i420 frame to output stream.
              source.onFrame(i420Frame);
            };

            // Apply method for updating the track to stream.
            description.setInputTrack = (track) => {
              // Cleanup last track.
              if (trackSink) {
                trackSink.removeEventListener('frame', renderTrackFrame);
                trackSink = undefined;
              }
              if (track) {  // -> Replace placeholder video by track.
                this.loggerService.debug(`Setting track with id ${track.id} ${track.muted} for media channel of label ${label} of driver with id ${driver.id}...`, this.constructor.name);
                // Clear the placeholder update interval.
                if (placeholderInterval) {
                  clearInterval(placeholderInterval);
                }
                // Prepare the track sink.
                trackSink = new RTCVideoSink(track);
                trackSink.addEventListener('frame', renderTrackFrame);
                this.loggerService.debug(`Track with id ${track.id} for media channel of label ${label} of driver with id ${driver.id} set`, this.constructor.name);
              } else {      // ->Replace track by placeholder video.
                this.loggerService.debug(`Removing track from media channel of label ${label} of driver with id ${driver.id}...`, this.constructor.name);
                // Set the placeholder update interval.
                if (!placeholderInterval) {
                  placeholderInterval = setInterval(renderPlaceholderFrame, 1000 / PLACEHOLDER_FPS);
                }
                this.loggerService.debug(`Track from media channel of label ${label} of driver with id ${driver.id} removed`, this.constructor.name);
              }
            };

            placeholderInterval = setInterval(renderPlaceholderFrame, 1000 / PLACEHOLDER_FPS);
            this.loggerService.debug(`Track for media channel of label ${label} prepared`, this.constructor.name);
          }
          this.loggerService.debug(`Adding track ${description.outputTrack} to peer ${peer}`, this.constructor.name);
          peer.addTrack(description.outputTrack);
        });
      }
    });
    this.peers[id] = peer;
    this.loggerService.verbose(`New local peer with ID "${id}" was created`, this.constructor.name);
    return id;
  }

  /**
   * Removes an event listener.
   * @param event Name of event.
   * @param listener Listener callback.
   */
  removeListener(event: 'peer', listener: (args: any[]) => void): void {
    this.eventEmitter.removeListener(event, listener);
  }

  /**
   * Sends data to all local peers with matching channel.
   * @param data Data to send.
   * @param label Label of channel to send data.
   */
  send(data: string, channel: string): void {
    const channels = this.getChannelsByLabel(channel);
    channels.forEach(ch => {
      this.loggerService.verbose(
        `Sending data to channel with ID "${ch.id}" and label "${ch.label}": "${data}"`,
        this.constructor.name,
      );
      ch.send(data);
    });
  }

  // /**
  //  * Sets an ICE candidate for the local peer.
  //  * @param id Identity of local peer.
  //  * @param candidate Received ICE candidate.
  //  */
  // async setCandidate(
  //   id: string,
  //   candidate: RTCIceCandidateInit,
  // ): Promise<void> {
  //   this.loggerService.verbose(
  //     `Setting ICE candidate of local peer with ID "${id}" to "${JSON.stringify(
  //       candidate,
  //     )}"...`,
  //     this.constructor.name,
  //   );
  //   const peer = this.peers[id];
  //   if (!peer) throw `Invalid local peer ID "${id}"`;
  //   await peer.addIceCandidate(candidate);
  //   this.loggerService.verbose(
  //     `ICE candidate of local peer with ID "${id}" successfully set to "${JSON.stringify(
  //       candidate,
  //     )}"`,
  //     this.constructor.name,
  //   );
  // }

  /**
   * Sets a session description for the local peer an generates an answer.
   * @param id Identity of local peer.
   * @param description Received session description.
   * @returns Answer to session description.
   */
  async setDescription(
    id: string,
    description: RTCSessionDescriptionInit,
  ): Promise<RTCSessionDescriptionInit> {
    this.loggerService.verbose(
      `Setting remote session description of local peer with ID "${id}" to "${JSON.stringify(
        description,
      )}"...`,
      this.constructor.name,
    );
    const peer = this.peers[id];
    if (!peer) throw `Invalid local peer ID "${id}"`;
    await peer.setRemoteDescription(description);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    this.loggerService.verbose(
      `Local session description of local peer with ID "${id}" successfully set to "${JSON.stringify(
        answer,
      )}"`,
      this.constructor.name,
    );
    return answer;
  }
}
