import { Component, Input } from '@angular/core';

import { Sensor } from '../../interfaces/sensor.class';

@Component({ template: '' })
export abstract class CustomSensorComponent {

  /**
   * Reference to sensor.
   */
  @Input()
  abstract sensor: Sensor;
}
