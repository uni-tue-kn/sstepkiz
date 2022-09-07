export class ApdmDriverConfiguration {
  ap: {
    /**
     * Wireless channel to use.
     */
    channel: number;

    /**
     * Sampling rate of sensors.
     */
    sampleRate: number;
  } = {
    channel: 60,
    sampleRate: 128,
  };

  erase: boolean = false;

  streaming: boolean = false;

  /**
   * Array of sensor configurations.
   */
  sensors: { id: number, label: string }[] = [];
}
