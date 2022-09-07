export interface ApdmDevice {

  /**
   * Identity of device.
   */
  deviceId: number;

  /**
   * Label of device or undefined if unknown.
   */
  deviceLabel?: string;

  /**
   * Directory of mounted sensor's internal storage or undefined if not docked.
   */
  directory?: string;

  /**
   * If device is connected via Docking Station.
   */
  docked: boolean;
}
