import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { DeviceType, Peer, Result, User } from '@sstepkiz';
import { ImeraApiService } from 'projects/imera-api/src/public-api';

import { RtcService } from '../../services/rtc.service';

@Component({
  selector: 'lib-sensor-page',
  styleUrls: ['./sensor-page.component.css'],
  templateUrl: './sensor-page.component.html',
})
export class SensorPageComponent implements AfterViewInit {

  @Input('user')
  user: User;

  constructor(
    private rtcService: RtcService,
    private imeraApiService: ImeraApiService,
  ) { }

  ngAfterViewInit(): void {
    this.exposition = 'baseline';
  }

  /**
   * Text for the full screen button
   */
  fullscreenButtonText: string = "Zu Vollbild wechseln";

  _persons: string = 'patient';
  get persons(): string {
    return this._persons;
  }
  set persons(value: string) {
    if (value === this._persons) return;
    this._persons = value;
    console.log(`New person state: ${value}`);
    this.send(value);
  }
  
  _exposition: string;
  get exposition() : string {
    return this._exposition;
  }
  set exposition(value: string) {
    if (value === this._exposition) return;
    this._exposition = value;
    console.log(`New exposition state: '${value}'`);
    this.send(value);
  }

  @ViewChild('labelText')
  labelText: ElementRef<HTMLInputElement>;

  sendComment(): void {
    const input = this.labelText.nativeElement;
    console.log(input);
    const value = input.value;
    input.value = '';
    this.send('txt: "' + value + '"');
  }

  /**
   * Declares device type enum for template.
   */
  modes = DeviceType;

  /**
   * True if button alle Sensoren starten is clickt
   */
  play: boolean = false;

  /**
   * Div with all the sensor components.
   */
  @ViewChild('fullscreen')
  sensorContainer: ElementRef;

  get sensorContainerElement(): HTMLDivElement {
    return this.sensorContainer?.nativeElement;
  }

  private peer?: Peer;

  async call(userId: string, socketId: string, mode: DeviceType.Monitor | DeviceType.Receiver): Promise<void> {
    // This needs to be done only once for the whole session:
    try {
      this.close();
      this.peer = await this.rtcService.call(userId, socketId, mode);
    } catch (error) {
      console.error(error);
      this.close();
    }
  }

  private close() {
    if (this.peer) {
      try {
        this.peer.close(this.rtcService.signallingChannel);
      } catch (error) {
        console.error('Failed to close peer', error);
      }
      this.peer = undefined;
      this.play = false;
    }
  }

  /**
   * Starts the video the eyetracking and the bodyfunctions sensors transmission.
   */
  start() {
    this.play = true;
    this.call(this.sender.userId, this.sender.socketId, this.modes.Receiver)
  }

  /**
   * Ends the functions in eyetracker component and bodyfunctions component.
   */
  end() {
    this.play = false;
    this.close();
  }

  /**
   * sends which of the three buttons Start, cognitive Intervention, End was pressed to the Observation time marker
   */
  send(buttonText: string): void {
    let result: Result = new Result(
      { id:  this.user.id},
      { id: this.imeraApiService.TIME_MARKER_CONTEXT_ID },
      [{ observation: {
          id: this.imeraApiService.TIME_MARKER_OBSERVATION_ID
        },
        textValue: buttonText
      }])
    this.imeraApiService.postNewResult(result)
      .catch(error => console.error(error));
  }

  get sender() {
    return this.rtcService.sender(this.user.name);
  }

  /**
    * Opens and closes full screen mode.
    */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.sensorContainerElement.requestFullscreen();

      this.fullscreenButtonText = "Vollbild beenden"
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        this.fullscreenButtonText = "Zu Vollbild wechseln"
      }
    }
  }
}
