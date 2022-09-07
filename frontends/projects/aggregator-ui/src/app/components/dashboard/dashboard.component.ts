import { Component } from '@angular/core';

import { SensorService } from '../../services/sensor/sensor.service';

@Component({
  selector: 'app-ble-dashboard',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {

  /**
   * Constructs a new Dashboard Component.
   * @param sensorService Sensor Service instance.
   */
  constructor(
    readonly sensorService: SensorService,
  ) {}
}
