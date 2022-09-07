import { DeviceType } from "./device-type.enum";

export class RtcConfig {
  stunServers: string[] = [];
  turnServers: string[] = [];
  mode: DeviceType = DeviceType.Receiver;
  signallingServerUrl = '';
}
