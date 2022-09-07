import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { CustomSensorComponent } from '../custom-sensor/custom-sensor.component';
import { LookEtkSensor } from '../../interfaces/look-etk-sensor.class';

@Component({
  selector: 'app-look',
  styleUrls: ['./look.component.scss'],
  templateUrl: './look.component.html',
})
export class LookComponent extends CustomSensorComponent implements OnInit {

  /**
   * Indicates if driver is muted.
   */
  muted: boolean = false;

  /**
   * Reference to Look eye tracking sensor.
   */
  sensor: LookEtkSensor;

  /**
   * Indicates if calibrator should be shown.
   */
  showCalibrator: boolean = false;

  /**
   * Received media stream.
   */
  stream?: MediaStream;

  @ViewChild('preview')
  previewElement: ElementRef<HTMLVideoElement>;

  /**
   * Initializes the custom Look Component.
   */
  ngOnInit(): void {
    this.stream = this.sensor.stream;
    setInterval(() => {
      this.previewElement?.nativeElement?.play();
    }, 1000);
  }

  async mute(): Promise<void> {
    try {
      await this.sensor.mute();
      this.muted = true;
    } catch (error) {
      console.error(error);
    }
  }

  async unmute(): Promise<void> {
    try {
      await this.sensor.unmute();
      this.muted = false;
    } catch (error) {
      console.error(error);
    }
  }
}
