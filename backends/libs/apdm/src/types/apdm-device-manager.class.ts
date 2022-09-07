import { exec } from "child_process";

import { ApdmDevice } from "./apdm-device.interface";

export class ApdmDeviceManager {

  /**
   * Internal APDM devices.
   */
  private readonly apdmDevices: ApdmDevice[] = [];

  /**
   * Gets all ever connected APDM devices.
   */
  get devices(): ApdmDevice[] {
    return this.apdmDevices;
  }

  /**
   * ID of interval which updates docked devices.
   */
  private dockedDeviceUpdateInterval?: NodeJS.Timeout = undefined;

  /**
   * Gets all the sensors which are connected to the docking station.
   */
  private getDockedSensors(): Promise<{ deviceId: number, directory: string }[]> {
    return new Promise<{ deviceId: number, directory: string }[]>((resolve, reject) => {
      // Execute command to drive letter and volume name of connected volumes.
      // WARNING: THIS WORKS ONLY ON WINDOWS!
      exec('wmic logicaldisk get name,VolumeName', (error, stdout, stderr) => {
        if (error) {
          reject (error);
        } else if (stderr) {
          reject(stderr);
        } else {
          // Get each row of command output.
          const rows = stdout.split('\n');
          // Remove first line (headline).
          rows.shift();
          // Extract name and volume name of each disk.
          const disks = rows.map(l => {
            // Get columns of row.
            const cols = l.split(' ').filter(c => c);
            // Extract name and volume name from row.
            return {
              name: cols[0],
              volumeName: cols[1]
            };
          });
          // Filter APDM disks.
          const apdmDisks = disks.filter(d => d.volumeName && d.volumeName.startsWith('XI-'));
          // Extract device IDs and and directories from APDM disks.
          const devices = apdmDisks.map(d => ({
            deviceId: Number(d.volumeName.replace(/^XI-0*/, '')),
            directory: d.name + '\\'
          }));
          resolve(devices);
        }
      });
    });
  }

  /**
   * Starts updating the docked devices.
   * @param interval Update interval in ms.
   */
  async startWatching(interval: number): Promise<void> {
    // Cancel if interval is already running.
    if (this.dockedDeviceUpdateInterval) {
      return;
    }
    // Update docked devices.
    await this.updateDockedDevices();
    // Set the interval.
    this.dockedDeviceUpdateInterval = setInterval(() => {
      this.updateDockedDevices();
    }, interval);
  }
  /**
   * Stops updating the docked devices.
   */
  stopWatching(): void {
    if (this.dockedDeviceUpdateInterval) {
      clearInterval(this.dockedDeviceUpdateInterval);
      this.dockedDeviceUpdateInterval = undefined;
    }
  }

  /**
   * Updates the docked devices.
   */
  async updateDockedDevices(): Promise<void> {
    // Get all docked sensors.
    const dockedSensors = await this.getDockedSensors();
    // Update states of docked devices and add new devices.
    dockedSensors.forEach(ds => {
      // Get the index of the device in list of all devices.
      let index = this.apdmDevices.findIndex(d => d.deviceId === ds.deviceId);
      if (index < 0) {
        // Device is not yet listed.
        // Create new device.
        const device = {
          deviceId: ds.deviceId,
          docked: true,
          directory: ds.directory
        };
        // Insert the new device.
        this.apdmDevices.push(device);
        // Get the index of the inserted device.
        index = dockedSensors.indexOf(device);
      } else {
        // Device is already listed.
        // Get the device object.
        const device = this.apdmDevices[index];
        // Update device properties.
        device.docked = true;
        device.directory = ds.directory
      }
    });
    // Update states of not docked devices.
    this.apdmDevices.forEach(d => {
      // Ensure that the device is not yet updated.
      const index = dockedSensors.findIndex(device => device.deviceId === d.deviceId);
      if (index < 0) {
        d.docked = false;
        d.directory = undefined;
      }
    });
  }
}
