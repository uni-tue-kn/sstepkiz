import { LookComponent } from '../components/look/look.component';
import { SensorPeerInterface } from './sensor-peer.interface';
import { Sensor } from './sensor.class';

export class LookEtkSensor extends Sensor {

  readonly customComponent = LookComponent;

  readonly stream = new MediaStream();

  /**
   * Constructs a new Movesense ECG sensor.
   * @param type Type of sensor. Use 'ecg' here!
   * @param driver Name of driver.
   * @param id Identity of driver.
   * @param peerInterface Interface to interact with peer connection.
   */
   constructor(
    type: string,
    driver: string,
    id: string,
    peerInterface: SensorPeerInterface
  ) {
    super(type, driver, id, peerInterface);
    const transceiver = this.peerInterface.addTransceiver('video', { direction: 'recvonly' });
    this.stream.addTrack(transceiver.receiver.track);
  }

  protected async _initialize(): Promise<void> {
    await super._initialize();
  }

  async mute(): Promise<void> {
    if (!this.peerInterface.hasChannel('customConfig')) {
      throw 'Custom channel not found';
    }
    const channel = await this.peerInterface.getChannel('customConfig');
    await new Promise<void>((resolve, reject) => {
      const onResponse = (ev: MessageEvent<any>) => {
        if (ev.data === 'muted') {
          channel.removeEventListener('message', onResponse);
          resolve();
        } else if ((ev.data as string).startsWith('error:')) {
          reject((ev.data as string).split(':')[1]);
        }
      };
      channel.addEventListener('message', onResponse);
      channel.send('unmute');
    });
  }

  async unmute(): Promise<void> {
    if (!this.peerInterface.hasChannel('customConfig')) {
      throw 'Custom channel not found';
    }
    const channel = await this.peerInterface.getChannel('customConfig');
    await new Promise<void>((resolve, reject) => {
      const onResponse = (ev: MessageEvent<any>) => {
        if (ev.data === 'unmuted') {
          channel.removeEventListener('message', onResponse);
          resolve();
        } else if ((ev.data as string).startsWith('error:')) {
          reject((ev.data as string).substring('error:'.length));
        }
      };
      channel.addEventListener('message', onResponse);
      channel.send('unmute');
    });
  }
}
