import { SensorCommand, SensorConfigMessage } from "@sstepkiz";

import { SensorDriver } from "./sensor/sensor-driver";

const commands: { [command in SensorCommand]: (driver: SensorDriver) => Promise<boolean> } = {
  configure: async (driver) => await driver.configure(),
  connect: async (driver) => await driver.connect(),
  disconnect: async (driver) => await driver.disconnect(),
  initialize: async (driver) => await driver.initialize(),
  reset: async (driver) => await driver.reset(),
  startCalibrating: async (driver) => await driver.startCalibrating(),
  startRecord: async (driver) => await driver.startRecording(),
  startStreaming: async (driver) => await driver.startStreaming(),
  stopCalibrating: async (driver) => await driver.stopCalibrating(),
  stopRecord: async (driver) => await driver.stopRecording(),
  stopStreaming: async (driver) => await driver.stopStreaming(),
  terminate: async (driver) => await driver.terminate()
};

export function ConfigChannelDescription(driver: SensorDriver): ChannelDescription {
  const sendCallbacks: ((data: string) => void)[] = [];
  const updateState = () => {
    driver.sendState();  
  }
  return {
    configuration: {
      maxPacketLifeTime: 5000,
      ordered: true
    },
    onData: async (data: string) => {
      const msg: SensorConfigMessage = JSON.parse(data);
      switch (msg.type) {
        case 'cmd':
          await commands[msg.command](driver);
          break;
        case 'state':
          // States cannot be changed by client.
          break;
      }
    },
    onOpen: () => {
      driver.addListener('calibratingStateChange', updateState);
      driver.addListener('calibrationStateChange', updateState);
      driver.addListener('calibrationStateChange', updateState);
      driver.addListener('configurationStateChange', updateState);
      driver.addListener('connectionStateChange', updateState);
      driver.addListener('initializationStateChange', updateState);
      driver.addListener('recordingStateChange', updateState);
      driver.addListener('streamingStateChange', updateState);
      updateState();
    },
    onClose: () => {
      driver.removeListener('calibratingStateChange', updateState);
      driver.removeListener('calibrationStateChange', updateState);
      driver.removeListener('configurationStateChange', updateState);
      driver.removeListener('connectionStateChange', updateState);
      driver.removeListener('initializationStateChange', updateState);
      driver.removeListener('recordingStateChange', updateState);
      driver.removeListener('streamingStateChange', updateState);
    },
    sendCallbacks
  }
}

export interface ChannelDescription {
  configuration: RTCDataChannelInit;
  onData?: (data: any) => any;
  onOpen?: () => any;
  onClose?: () => any;
  sendCallbacks?: ((data: string) => void)[];
}

export interface StreamDescription {
  kind: 'audio' | 'video';
  outputTrack?: MediaStreamTrack;
  setInputTrack?: (track?: MediaStreamTrack) => void
}

export interface ChannelDescriptionMap {

  /**
   * Mapping of labels to data channel descriptions.
   */
  dataChannels?: {
    [label: string]: ChannelDescription;
  };

  /**
   * Mapping of labels to media stream descriptions.
   */
  mediaChannels?: {
    [label: string]: StreamDescription;
  };
}
