import { AuthService } from '@libs/client-auth';
import { LoggerService } from '@libs/logger';
import { EventManager, sleep } from '@libs/sensor-api';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { SensorPropertyState } from '@sstepkiz';
import { firstValueFrom } from 'rxjs';
import { MediaStreamTrack, RTCPeerConnection } from 'wrtc';

interface LookConnectorEventMap {
  'calibratingStateChange': [state: SensorPropertyState];
  'calibrationStateChange': [calibrated: boolean];
  'connectionStateChange': [connectionState: RTCPeerConnectionState];
  'recordingStateChange': [state: SensorPropertyState];
  'track': [track: MediaStreamTrack];
}
type TrackerModes = 'live' | 'replay' | 'analysis';
type CalibrationStates = 'uncalibrated' | 'calibrating' | 'calibrated' | 'processing';
type RecordingStates = 'recording' | 'not_recording';
type PlaybackStates = 'replay' | 'analysis';
type MediaStates = 'playing' | 'paused';
interface LookStateConstraints {
  subjectId?: string | string[];
  trackerMode?: TrackerModes | TrackerModes[];
  calibrationState?: CalibrationStates | CalibrationStates[];
  recordingState?: RecordingStates | RecordingStates[];
  playbackState?: PlaybackStates | PlaybackStates[];
  playingState?: MediaStates | MediaStates[];
}
interface LookState {
  subjectId: string;
  trackerMode: TrackerModes;
  calibrationState: CalibrationStates;
  recordingState: RecordingStates;
  playbackState: PlaybackStates;
  playingState: MediaStates;
}

@Injectable()
export class LookConnectorService {

  /**
   * Mapping of subject IDs to subject names.
   */
  private readonly subjectMap = new Map<number, string>();

  /**
   * Emits events.
   */
  private readonly emitter = new EventManager();

  /**
   * Peer connection to Look Server.
   */
  private peer?: RTCPeerConnection;

  /**
   * Data channel for commands to Look Server.
   */
  private commandChannel?: RTCDataChannel;

  /**
   * Gets the connection state to Look Server.
   */
  get connectionState(): RTCPeerConnectionState {
    if (this.peer) {
      return this.peer.connectionState;
    } else {
      return 'new';
    }
  }

  private _calibrated: boolean = false;
  /**
   * Gets if the eye tracker is calibrated.
   */
  get calibrated(): boolean {
    return this._calibrated;
  }
  /**
   * Sets if the eye tracker is calibrated.
   * @param calibrated If eye tracker is calibrated.
   */
  private setCalibrated(calibrated: boolean): void {
    this._calibrated = calibrated;
    this.emit('calibrationStateChange', calibrated);
  }

  private _calibratingState: SensorPropertyState;
  /**
   * Gets the calibration state.
   */
  get calibrationState(): SensorPropertyState {
    return this._calibratingState;
  }
  /**
   * Sets the calibration state.
   * @param state New calibration state.
   */
  private setCalibratingState(state: SensorPropertyState): void {
    this._calibratingState = state;
    this.emit('calibratingStateChange', state);
  }

  /**
   * Identity of authenticated patient.
   */
   private get patientId(): string {
    return this.authService.claims?.preferred_username ?? 'offline';
  }

  private _recordingState: SensorPropertyState;
  /**
   * Gets the recording state.
   */
  get recordingState(): SensorPropertyState {
    return this._recordingState;
  }
  /**
   * Sets the recording state.
   * @param state New recording state.
   */
  private setRecordingState(state: SensorPropertyState): void {
    this._recordingState = state;
    this.emit('recordingStateChange', state);
  }

  private _track?: MediaStreamTrack;
  /**
   * Gets the current receiving eye tracking video stream track or undefined if not receiving.
   */
  get track(): MediaStreamTrack | undefined {
    return this._track;
  }
  /**
   * Gets the current receiving eye tracking video stream track and requests it if not yet receiving.
   * @returns Received camera video stream track.
   */
  async getTrack(): Promise<MediaStreamTrack> {
    if (this._track) {
      return this._track;
    } else {
      this.logger.verbose(`Track not found, waiting for new track`, this.constructor.name);
      return await new Promise<MediaStreamTrack>((resolve) => {
        const onTrack = (track: MediaStreamTrack) => {
          this.removeEventListener('track', onTrack);
          resolve(track);
        };
        this.addEventListener('track', onTrack);
      });
    }
  }

  /**
   * Constructs a new Look Connector Service.
   * @param authService Authentication service instance.
   * @param http HTTP Client instance.
   * @param logger Logger Service instance.
   */
  constructor(
    private readonly authService: AuthService,
    private readonly http: HttpService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Emits an event.
   * @param event Name of event.
   * @param data Data to emit.
   */
  private emit<K extends keyof LookConnectorEventMap>(event: K, ...data: LookConnectorEventMap[K]): void {
    this.emitter.fire(event, ...data);
  }
  /**
   * Adds an event listener callback to a specific event.
   * @param event Name of event.
   * @param callback Listener callback to add.
   */
  addEventListener<K extends keyof LookConnectorEventMap>(event: K, callback: (...data: LookConnectorEventMap[K]) => void): void {
    this.emitter.on(event, callback);
  }
  /**
   * Removes an event listener callback from a specific event.
   * @param event Name of event.
   * @param callback Listener callback to remove.
   */
  removeEventListener<K extends keyof LookConnectorEventMap>(event: K, callback: (...data: LookConnectorEventMap[K]) => void): void {
    this.emitter.off(event, callback);
  }

  private processMessage(evt: MessageEvent<string>){
    const parts = evt.data.split(';');
    let hv_ratio: number, distance_per_second: number, gaze_x: number, gaze_y: number, name_parts: string[], name_str: string, subject_id: string;
    if (parts[0] == "sbj"){
      // document.getElementById('subjectnames').innerHTML  = "";
      for (let i = 1; i < parts.length; i++) {
        name_parts = parts[i].split(',');
        name_str = name_parts[1] + " " + name_parts[2];
        subject_id = name_parts[0]
        // if(subject_id.length > 0) {
        //   var option = document.createElement('option');
        //   option.value = name_str;
        //   option.innerHTML = subject_id;
        //   document.getElementById('subjectnames').appendChild(option);
        // }
      }
    }
    // if (parts[0] == "ply"){
    //   document.getElementById('recordings').innerHTML  = "";
    //   for (let i = 1; i < parts.length; i++) {
    //     name_parts = parts[i].split(',');
    //     var option = document.createElement('option');
    //     option.value = name_parts[0];
    //     option.text = name_parts[1]
    //     document.getElementById('recordings').appendChild(option);
    //   }
    //   if (parts.length>1 && parts[1] == "pos"){
    //     document.getElementById('videoProgress').value = parseFloat(parts[2]);
    //   }
    // }
    if (parts[0] == "gaze_stats"){
      hv_ratio = parseFloat(parts[1]);
      distance_per_second = parseFloat(parts[2]);
      // setProgressBar('gaze_hvratio', hv_ratio, 0, 5);
      // setProgressBar('gaze_distance', distance_per_second, 0, 100);
    }
    if (parts[0] == "gaze"){
      gaze_x = parseInt(parts[1])-40;
      gaze_y = parseInt(parts[2])-40;
      //document.getElementById("video_overlays").style.top=""+gaze_y+ "px";
      //document.getElementById("video_overlays").style.left=""+gaze_x+ "px";
      // console.log(gaze_x, gaze_y);
    }
    if (parts[0] == "sta"){
      //console.log(event.data);
      subject_id = parts[1];
      // automatically set the subject in case it was already set server-sided
      // set_subject_selection_from_server(subject_id)
      let tracker_mode = parts[2]; // [live]! / replay
      let calibration_state = parts[3];
      let recording_state = parts[4];
      let playback_state = parts[5]; // in replay ob pause oder play
      let playing_state = parts[6]; // nicht relevant (analyse)
      this.logger.debug(`Received calibration state: "${calibration_state}"`, this.constructor.name);
      switch (calibration_state) {
        case "uncalibrated":
          this.setCalibratingState('stopped');
          this.setCalibrated(false);
          break;
        case "calibrating":
          this.setCalibratingState('running');
          this.setCalibrated(false);
          break;
        case "calibrated":
          this.setCalibratingState('stopped');
          this.setCalibrated(true);
          break;
        case "processing":
          this.setCalibratingState('stopping');
          this.setCalibrated(false);
          break;
      }
      switch (recording_state) {
        case "not_recording":
          // setNotRecording();
          this.setRecordingState('stopped');
          break;
        case "recording":
          this.setRecordingState('running');
          // setRecording();
          break;
      }
      // switch(tracker_mode){
      //   case "live":
      //     setLiveMode();
      //     break;
      //   case "replay":
      //     setReplaying();
      //     break;
      //   case "analysis":
      //     setAnalysing();
      //     break;
      // }
      // if (tracker_mode == "replay" || tracker_mode == "analysis") {
      //   switch (playback_state) {
      //     case "replay":
      //       setReplaying();
      //       break;
      //     case "analysis":
      //       setAnalysing();
      //   }
      //   switch(playing_state){
      //     case "playing":
      //       setPlaying();
      //       break;
      //     case "paused":
      //       setPaused();
      //       break;
      //   }
      // }
    }
  }

  async updateSubjectMap(): Promise<void> {
    this.commandChannel.send('cmd sbj list');
    await new Promise<void>((resolve) => {
      const onMessage = (ev: MessageEvent<string>) => {
        if (!ev.data) return;
        const parts = ev.data.split(';');
        if (parts.shift() !== 'sbj') return;
        this.commandChannel.removeEventListener('message', onMessage);
        this.subjectMap.clear();
        parts.forEach(e => {
          const parts = e.split(',');
          const subjectId = Number.parseInt(parts[0]);
          const subjectName = `${parts[1]} ${parts[2]}`;
          this.subjectMap.set(subjectId, subjectName);
        });
        resolve();
      };
      this.commandChannel.addEventListener('message', onMessage);
    });
  }

  async getSubject(id: number): Promise<string> {
    if (!this.subjectMap.has(id)) {
      await this.updateSubjectMap();
    }
    return this.subjectMap.get(id);
  }

  /**
   * Awaits state message from Look Server.
   * @param constraints Optional constraints to fulfill.
   * @param timeout Timeout in ms.
   * @throws Response timeout.
   * @throws Invalid response.
   * @throws Parsing failed.
   */
  async getStateResponse(constraints?: LookStateConstraints, timeout: number = 10000): Promise<LookState> {
    try {
      this.commandChannel.send('cmd sta get');
    } catch (error) {
      throw `Failed to send command "cmd sta get" to Look Server: ${error}`;
    }
    let timeoutId: NodeJS.Timeout = undefined;
    try {
      const response = await Promise.race([
        new Promise<LookState>((resolve, reject) => {
          const onMessage = async (ev: MessageEvent<string>) => {
            // Ensure that data was received.
            if (!ev.data) return;
            try {
              // Split message into its parts.
              const parts = ev.data.split(';');
              // Ensure that message contains states.
              if (parts[0] !== 'sta') return;
              const response: LookState = {
                subjectId: await this.getSubject(Number.parseInt(parts[1])),
                trackerMode: parts[2] as TrackerModes,
                calibrationState: parts[3] as CalibrationStates,
                recordingState: parts[4] as RecordingStates,
                playbackState: parts[5] as PlaybackStates,
                playingState: parts[6] as MediaStates,
              }
              // Check if constraints are set.
              if (constraints) {
                // Validate if any constraint does not match the message.
                if (constraints.subjectId && ((Array.isArray(constraints.subjectId) && constraints.subjectId.indexOf(response.subjectId) < 0) || constraints.subjectId !== response.subjectId)) return;
                if (constraints.trackerMode && ((Array.isArray(constraints.trackerMode) && constraints.trackerMode.indexOf(response.trackerMode) < 0) || constraints.trackerMode !== response.trackerMode)) return;
                if (constraints.calibrationState && ((Array.isArray(constraints.calibrationState) && constraints.calibrationState.indexOf(response.calibrationState) < 0) || constraints.calibrationState !== response.calibrationState)) return;
                if (constraints.recordingState && ((Array.isArray(constraints.recordingState) && constraints.recordingState.indexOf(response.recordingState) < 0) || constraints.recordingState !== response.recordingState)) return;
                if (constraints.playbackState && ((Array.isArray(constraints.playbackState) && constraints.playbackState.indexOf(response.playbackState) < 0) || constraints.playbackState !== response.playbackState)) return;
                if (constraints.playbackState && ((Array.isArray(constraints.playingState) && constraints.playingState.indexOf(response.playingState) < 0) || constraints.playingState !== response.playingState)) return;
              }
              // All constraints match the message -> Resolve.
              this.commandChannel.removeEventListener('message', onMessage);
              resolve(response);
            } catch (error) {
              reject(`Failed to parse response of "${ev.data}": ${error}`);
            }
          };
          this.commandChannel.addEventListener('message', onMessage);
        }),
        new Promise<void>((_, reject) => {
          // Set timeout 
          timeoutId = setTimeout(() => {
            // Reject with timeout.
            reject('Response timeout');
          }, timeout);
        }),
      ]);
      if (response instanceof Object) {
        return response;
      } else {
        throw 'Invalid response';
      }
    } catch (error) {
      throw error;
    } finally {
      // Clear the timeout.
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  /**
   * Connects to the Look Server.
   * @param peerUri REST endpoint URI of remote peer.
   * @param forceReconnect If connection should be enforced even if already connected.
   */
  async connect(peerUri: string, forceReconnect: boolean = false): Promise<void> {
    if (this.peer && !forceReconnect) {
      this.logger.debug(`Already connected to Look Server!`, this.constructor.name);
      return;
    }
    await new Promise<void>(async (resolve, reject) => {
      this.logger.debug(`Preparing new connection...`, this.constructor.name);
      const peer = new RTCPeerConnection();
      this.commandChannel = peer.createDataChannel('commands', { ordered: true });
      this.commandChannel.addEventListener('open', async () => {
        try {
          // Request state and wait for response.
          let state = await this.getStateResponse();
          // Check if subject ID is already set correctly.
          if (state.subjectId !== `${this.patientId} ${this.patientId}`) {
            this.logger.log(`Subject ID of Look Server is set to ${state.subjectId}. Setting subject ID to "${this.patientId} ${this.patientId}"...`, this.constructor.name);
            // Subject ID not set correctly -> Ensure that subject ID can be set.
            // Setting subject ID is not allowed when recording or calibrating.
            if (state.recordingState === 'recording' || state.calibrationState === 'calibrating') {
              this.logger.warn(`Subject ID cannot be set: Recording state is ${state.recordingState}. Calibration state is ${state.calibrationState}. Stopping both...`, this.constructor.name);
              // Stop recording if necessary.
              if (state.recordingState === 'recording') {
                this.commandChannel.send('cmd rec stop');
                await this.getStateResponse({ recordingState: 'not_recording' });
              }
              // Stop calibrating if necessary.
              if (state.calibrationState === 'calibrating') {
                this.commandChannel.send('cmd cal stop');
                await this.getStateResponse({ calibrationState: ['calibrated', 'processing', 'uncalibrated'] });
              }
            }
            this.logger.log(`Setting Subject ID to ${this.patientId} ${this.patientId}`, this.constructor.name);
            // Set Subject Id and await response.
            this.commandChannel.send(`cmd sbj ${this.patientId} ${this.patientId}`);
            state = await this.getStateResponse({ subjectId: `${this.patientId} ${this.patientId}` });
          }
          this.logger.log(`Subject ID is set to ${state.subjectId}`, this.constructor.name);
          resolve();
          // Subject ID is set -> Move on.
        } catch (error) {
          this.disconnect();
          reject(`Failed to connect to Look Server: ${error}`);
        }
      });
      this.commandChannel.addEventListener('message', (evt) => { this.processMessage(evt); });
      this.peer = peer;
      peer.addEventListener('connectionstatechange', () => {
        this.emit('connectionStateChange', this.connectionState);
      });
      peer.addEventListener('track', async (ev) => {
        if (!ev.track) return;
        this.logger.debug(`Track received from Look Server. Track ID: ${ev.track.id} Muted: ${ev.track.muted}`, this.constructor.name);
        if (ev.track.muted) {
          this.logger.debug(`Waiting for unmute of look track`, this.constructor.name);
          await new Promise<void>(resolve => {
            ev.track.addEventListener('unmute', () => {
              resolve();
            });
          });
        }
        this._track = ev.track;
        this.logger.verbose(`Emitting track event`, this.constructor.name);
        this.emit('track', ev.track);
      });
      peer.addTransceiver('video', { direction: 'recvonly' });
      this.logger.debug(`Creating offer...`, this.constructor.name);
      const offer = await peer.createOffer();
      this.logger.debug(`Offer created, setting local description: ${JSON.stringify(offer)}`, this.constructor.name);
      await peer.setLocalDescription(offer);
      this.logger.debug(`Local description set`, this.constructor.name);
      if (peer.iceGatheringState !== 'complete') {
        this.logger.debug(`ICE gathering state is ${peer.iceGatheringState}`, this.constructor.name);
        await new Promise<void>((resolve) => {
          const onIceGatheringStateChange = () => {
            this.logger.debug(`ICE gathering state changed: ${peer.iceGatheringState}`, this.constructor.name);
            if (peer.iceGatheringState === 'complete') {
              peer.removeEventListener('icegatheringstatechange', onIceGatheringStateChange);
              this.logger.debug(`ICE gathering completed!`, this.constructor.name);
              resolve();
            }
          }
          this.logger.debug(`Waiting for ICE gathering completion...`, this.constructor.name);
          peer.addEventListener('icegatheringstatechange', onIceGatheringStateChange);
        });
      } else {
        this.logger.debug(`ICE gathering already completed: ${peer.iceGatheringState}`, this.constructor.name);
      }
      this.logger.debug(`Getting updated local description ${JSON.stringify(peer.localDescription)}`, this.constructor.name);
      const localDescription: RTCSessionDescriptionInit = {
        sdp: peer.localDescription.sdp.split('\r\n').filter(p => !p.includes('candidate') || p.includes('127.0.0.1') || p.includes('::1')).join('\r\n'),
        type: peer.localDescription.type,
      };
      this.logger.debug(`Updated local description: ${JSON.stringify(localDescription)}`, this.constructor.name);
      this.logger.debug(`Sending local description to Look Server on ${peerUri}...`, this.constructor.name);
      let remoteDescription;
      while (!remoteDescription) {
        try {
          const result = (await firstValueFrom(this.http.post<RTCSessionDescriptionInit>(peerUri, localDescription))).data;
          remoteDescription = {
            type: result.type,
            sdp: result.sdp,//.split('\r\n').filter(p => !p.includes('candidate') || p.includes('127.0.0.1') || p.includes('::1')).join('\r\n'),
          }
        } catch (error) {
          this.logger.error(`Failed to connect to Look Software! Retry in 1s...`, this.constructor.name);
          await sleep(1000);
        }
      }
      this.logger.debug(`Received remote description: ${JSON.stringify(remoteDescription)}`, this.constructor.name);
      this.logger.debug(`Applying remote description...`, this.constructor.name);
      await peer.setRemoteDescription(remoteDescription);
      this.logger.debug(`Waiting for established connection... ConnectionState: ${peer.connectionState}, ICEConnectionState: ${peer.iceConnectionState}, SignalingState: ${peer.signalingState}`, this.constructor.name);
      if (peer.connectionState !== 'connected') {
        this.logger.debug(`Connection state is ${peer.connectionState}. Waiting for connected...`, this.constructor.name);
        await new Promise<void>((resolve) => {
          const onConnectionStateChange = () => {
            this.logger.debug(`Connection state changed to ${peer.connectionState}`, this.constructor.name);
            if (peer.connectionState === 'connected') {
              peer.removeEventListener('connectionstatechange', onConnectionStateChange);
              resolve();
            }
          }
          peer.addEventListener('connectionstatechange', onConnectionStateChange);
        });
      } else {
        this.logger.debug(`Connection state already ${peer.connectionState}`, this.constructor.name);
      }
      this.logger.debug(`Connected to Look Server!`, this.constructor.name);
    });
  }
  /**
   * Disconnects from Look Server.
   */
  disconnect(): void {
    this.logger.debug(`Disconnecting from Look Server...`, this.constructor.name);
    this.peer?.close();
    this.logger.debug(`Disconnected from Look Server!`, this.constructor.name);
  }

  /**
   * Sends a command to the Look Server process and awaits a specific response before resolving.
   * @param command Command to execute.
   * @param changeEvent Name of event to await.
   * @param resolveState State to resolve for.
   * @param rejectState State to fail for.
   * @param timeout Timeout in ms to wait for response.
   * @throws status request timeout.
   */
  private async sendCommandAndAwaitStatusChange(command: string, changeEvent: keyof LookConnectorEventMap, resolveState: SensorPropertyState, rejectState: SensorPropertyState, timeout: number = 5000): Promise<void> {
    await Promise.race([
      new Promise<void>((resolve, reject) => {
        let statusReceived = false;
        const onChange = (state: SensorPropertyState) => {
          statusReceived = true;
          switch (state) {
            case resolveState:
              resolve();
              break;
            case rejectState:
              reject();
              break;
            default:
              return;
          }
          this.removeEventListener(changeEvent, onChange);
        };
        this.addEventListener(changeEvent, onChange);
        this.commandChannel.send(command);
        this.commandChannel.send('cmd sta get');
      }),
      sleep(timeout).then(() => {
        throw 'timeout'
      }),
    ]);
  }

  /**
   * Starts the calibration process.
   * @throws When starting calibration process failed.
   */
  async startCalibrate(): Promise<void> {
    if (!this.commandChannel) {
      throw 'Command channel not connected';
    }
    try {
      const state = await this.getStateResponse();
      if (state.calibrationState === 'calibrating') return;
      if (state.subjectId !== `${this.patientId} ${this.patientId}`) throw 'Cannot start recording: Invalid subject ID';
      await this.sendCommandAndAwaitStatusChange('cmd cal start', 'calibratingStateChange', 'running', 'failed');
    } catch (error) {
      throw `Failed to start calibration: ${error}`;
    }
  }
  /**
   * Stops the calibration process.
   * @throws When starting calibration process failed.
   */
   async stopCalibrate(): Promise<void> {
    if (!this.commandChannel) {
      throw 'Command channel not connected';
    }
    try {
      const state = await this.getStateResponse();
      if (state.calibrationState !== 'calibrating') return;
      await this.sendCommandAndAwaitStatusChange('cmd cal stop', 'calibratingStateChange', 'stopped', 'failed');
    } catch (error) {
      throw `Failed to start calibration: ${error}`;
    }
  }

  /**
   * Starts the recording process.
   * @throws When starting recording process failed.
   */
  async startRecording(): Promise<void> {
    if (!this.commandChannel) {
      throw 'Command channel not connected';
    }
    try {
      const state = await this.getStateResponse();
      if (state.recordingState === 'recording') return;
      if (state.calibrationState === 'calibrating') throw 'Cannot start recording: Calibration in progress!';
      if (state.subjectId !== `${this.patientId} ${this.patientId}`) throw 'Cannot start recording: Invalid subject ID';
      await this.sendCommandAndAwaitStatusChange('cmd rec start', 'recordingStateChange', 'running', 'failed');
    } catch (error) {
      throw `Failed to start recording: ${error}`;
    }
  }
  /**
   * Stops the recording process.
   * @throws When stopping recording process failed.
   */
  async stopRecording(): Promise<void> {
    if (!this.commandChannel) {
      throw 'Command channel not connected';
    }
    try {
      const state = await this.getStateResponse();
      if (state.recordingState === 'not_recording') return;
      await this.sendCommandAndAwaitStatusChange('cmd rec stop', 'recordingStateChange', 'stopped', 'failed');
    } catch (error) {
      throw `Failed to start recording: ${error}`;
    }
  }
}
