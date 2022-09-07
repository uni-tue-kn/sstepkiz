export interface SensorInfo {

  /**
   * Array of related data channel's labels.
   */
  channels: string[];

  /**
   * Name of driver.
   * @example APDM
   * @example Look
   * @example MovesenseEcg
   */
  driver: string;

  /**
   * Identity of the sensor.
   */
  id: string;

  /**
   * Array of related tracks.
   */
  tracks: string[];

  /**
   * Type of sensor.
   * @example ecg
   * @example eda
   * @example etk
   * @example mov
   */
  type: string;
}
