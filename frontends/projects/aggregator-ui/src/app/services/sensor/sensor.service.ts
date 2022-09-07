import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SensorInfo } from '@sstepkiz';

import { environment } from '../../../environments/environment';
import { Sensor } from '../../interfaces/sensor.class';
import { PeerService } from '../peer/peer.service';

@Injectable({ providedIn: 'root' })
export class SensorService {

  private _sensors?: Sensor[];
  get sensors(): Sensor[] {
    if (this._sensors) {
      return [...this._sensors];
    } else {
      return [];
    }
  }

  constructor(
    private readonly http: HttpClient,
    private readonly peer: PeerService
  ) {
    this.initialize().catch((error) => {
      console.error(error);
    });
  }

  private async requestSensorInfo(): Promise<SensorInfo[]> {
    try {
      const url = `${environment.urls.aggregatorBackend}/sensors`;
      return await this.http.get<SensorInfo[]>(url).toPromise();
    } catch (error) {
      throw `Failed to request sensor information: ${JSON.stringify(error)}`;
    }
  }

  async initialize(): Promise<void> {
    try {
      const sensorInfo = await this.requestSensorInfo();
      this._sensors = await this.peer.connect(sensorInfo);
    } catch (error) {
      `Failed to initialize Sensor Service: ${error}`;
    }
  }
}
