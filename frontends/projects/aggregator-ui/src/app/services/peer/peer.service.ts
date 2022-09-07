import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SensorInfo } from '@sstepkiz';

import { environment } from '../../../environments/environment';
import { LookEtkSensor } from '../../interfaces/look-etk-sensor.class';
import { MovesenseMovSensor } from '../../interfaces/movesense-mov-sensor.class';
import { MovesenseEcgSensor } from '../../interfaces/movesense-ecg-sensor.class';
import { Sensor } from '../../interfaces/sensor.class';
import { SensorPeerInterface } from '../../interfaces/sensor-peer.interface';
import { BluetoothService } from '../bluetooth/bluetooth.service';
import { GattValueParserService } from '../gatt-value-parser/gatt-value-parser.service';

@Injectable({ providedIn: 'root' })
export class PeerService {

  constructor(
    private readonly bluetoothService: BluetoothService,
    private readonly http: HttpClient,
    private readonly parser: GattValueParserService,
  ) { }

  private async requestPeerId(): Promise<string> {
    try {
      const url = `${environment.urls.aggregatorBackend}/peer`;
      return (await this.http.get<{ id: string }>(url).toPromise()).id;
    } catch (error) {
      throw `Failed to request peer identity: ${JSON.stringify(error)}`;
    }
  }
  private async exchangeSessionDescription(id: string, localDescription: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    try {
      const url = `${environment.urls.aggregatorBackend}/peer/${id}/description`;
      return await this.http.put<RTCSessionDescriptionInit>(url, localDescription).toPromise();
    } catch (error) {
      throw `Failed to exchange session description: ${JSON.stringify(error)}`;
    }
  }
  private async negotiate(id: string, peer: RTCPeerConnection) {
    const localDescription = await peer.createOffer();
    await peer.setLocalDescription(localDescription);
    if (peer.iceGatheringState !== 'complete') {
      await new Promise<void>((resolve) => {
        const onIceGatheringStateChange = () => {
          if (peer.iceGatheringState === 'complete') {
            peer.removeEventListener('icegatheringstatechange', onIceGatheringStateChange);
            resolve();
          }
        }
        peer.addEventListener('icegatheringstatechange', onIceGatheringStateChange);
      });
    }
    const remoteDescription = await this.exchangeSessionDescription(id, peer.localDescription.toJSON());
    await peer.setRemoteDescription(remoteDescription);
  }

  async connect(sensorInfo: SensorInfo[]): Promise<Sensor[]> {
    const id = await this.requestPeerId();
    const peer = new RTCPeerConnection();
    peer.createDataChannel('com', {
      ordered: true,
      maxPacketLifeTime: 10000,
    });
    const sensors = sensorInfo.map((sensorInfo) => {
      const sensorPeer = new SensorPeerInterface(sensorInfo.id, peer);
      switch (sensorInfo.driver) {
        case 'MovesenseMov':
          return new MovesenseMovSensor(sensorInfo.type, sensorInfo.driver, sensorInfo.id, sensorPeer, this.bluetoothService, this.parser);
        case 'MovesenseEcg':
          return new MovesenseEcgSensor(sensorInfo.type, sensorInfo.driver, sensorInfo.id, sensorPeer, this.bluetoothService, this.parser);
        case 'Look':
          return new LookEtkSensor(sensorInfo.type, sensorInfo.driver, sensorInfo.id, sensorPeer);
        default:
          return new Sensor(sensorInfo.type, sensorInfo.driver, sensorInfo.id, sensorPeer);
      }
    });
    await Promise.all(sensors.map(
      async sensor => await sensor.initialize()
    ));
    await this.negotiate(id, peer);
    return sensors;
  }
}
