import { LoggerService } from '@libs/logger';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { notify } from 'node-notifier';

import { ApdmDriverConfiguration } from '../drivers/apdm-driver-configuration.class';
import { ApdmDevice } from "./apdm-device.interface";
import { ApdmFileConverterService } from './apdm-file-converter.service';

export class ApdmBackupManager {

  /**
   * Currently active backup interval.
   */
  private backupInterval?: NodeJS.Timeout = undefined;

  private copiedFiles: string[] = [];

  /**
   * Indicates if backup is running.
   */
  get backupRunning(): boolean {
    return this.processIsRunning;
  }
  /**
   * Indicates if backup process is running.
   */
  private processIsRunning: boolean = false;

  /**
   * Indicates if backup watcher is active.
   */
  get watching(): boolean {
    return !!this.backupInterval || this.backupRunning;
  }

  /**
   * Constructs a new Backup Manager.
   * @param loggerService Logger service.
   * @param config Driver configuration.
   * @param converter File converter service instance.
   */
  constructor(
    private readonly loggerService: LoggerService,
    private readonly config: ApdmDriverConfiguration,
    private readonly converter: ApdmFileConverterService,
  ) {}

  /**
   * Backs up process of sensor data.
   * Gets connected sensor devices and copies containing .h5 files to a specified directory.
   * @param backupDirectory Directory to store sensor raw data to.
   * @param targetDirectory Directory to store converted and synchronized data to.
   * @param devices Array of available APDM devices.
   * @param configure Callback to configure the sensors.
   */
  async backupSensorData(backupDirectory: string, targetDirectory: string, devices: ApdmDevice[], configure: (options: ApdmDriverConfiguration) => Promise<void>): Promise<void> {
    // Ensure that backup process is not running.
    if (this.processIsRunning) {
      return;
    }
    // Indicate running backup process.
    this.processIsRunning = true;
    // Gets docked devices.
    const dockedDevices = devices.filter(d => d.docked);
    const config = this.config;
    // Ensure that all sensors are connected.
    const dockedDeviceIds = dockedDevices.map(d => d.deviceId);
    const expectedDeviceIds = config.sensors?.map(s => s.id) ?? [];
    if (!expectedDeviceIds.map(d => dockedDeviceIds.includes(d)).reduce((prev, curr) => prev && curr)) {
      this.loggerService.debug(`Not all sensors connected`, this.constructor.name);
    } else {
      // Wait for all file names of connected sensors.
      try {
        const deviceFiles = await Promise.all(
          dockedDevices.map(d => (new Promise<{ files: string[], device: ApdmDevice }>((resolve, reject) => {
            // Get all files in device's root directory.
            fs.readdir(d.directory, { withFileTypes: true }, (err, files) => {
              if (err) {
                reject(err);
              } else {
                // Filter out only relevant .apdm files and get file names.
                const fileNames = files
                .filter(f => f.isFile() && f.name.endsWith('.apdm') && this.copiedFiles.indexOf(`${d.directory}${f.name}`) < 0)
                .map(f => f.name);
                // Add file names to device information.
                resolve({
                  files: fileNames,
                  device: d
                });
              }
            });
          })))
        );
        // Wait for backup tasks.
        const backupTasks = (await Promise.all(
          deviceFiles.map(df => (new Promise<{ src: string, dst: string }[]>((resolve, reject) => {
            // Generate name of directory where to backup sensor data to.
            const deviceTargetDir = path.join(backupDirectory, df.device.deviceId.toString());
            // Get existing (= already backed up) files in backup directory.
            fs.readdir(deviceTargetDir, { withFileTypes: true }, async (err, files) => {
              if (err) {
                // Backup directory does not yet exist -> Create one.
                try {
                  await new Promise<void>((resolve, reject) => {
                    fs.mkdir(deviceTargetDir, (err) => {
                      if (err) {
                        reject(err);
                      } else {
                        resolve();
                      }
                    });
                  });
                } catch (error) {
                  reject(error);
                }
                files = [];
              }
              // Map file infos to file names.
              const fileNames = files
              .filter(f => f.isFile() && f.name.endsWith('.apdm'))
              .map(f => f.name);
              // Get files that are not yet backed up.
              const notSyncedFiles = df.files.filter(f => fileNames.indexOf(f) < 0);
              // Generate backup task for each not backed up .apdm file.
              const tasks = notSyncedFiles.map(f => ({
                src: path.join(df.device.directory, f),
                dst: path.join(deviceTargetDir, f)
              }));
              resolve(tasks);
            });
          })))
        )).reduce((acc, cur) => acc.concat(cur), []);
        // Start backup task.
        const failedTasks: { src: string, dst: string }[] = [];
        if (backupTasks.length > 0) {
          notify({
            title: 'SSTeP-KiZ Backup',
            message: 'Backup der Bewegungssensoren läuft! Bewegungssensoren bitte nicht ausstecken',
            sound: true,
          });
        }
        for (let i = 0; i < backupTasks.length; i++) {
          this.loggerService.log(`Starting backup of ${backupTasks[i].src} to ${backupTasks[i].dst}`, this.constructor.name);
          // Start backup.
          const stats = await promisify(fs.stat)(backupTasks[i].src);
          try {
            await promisify(fs.copyFile)(backupTasks[i].src, backupTasks[i].dst);
            this.copiedFiles.push(backupTasks[i].src);
            await promisify(fs.utimes)(backupTasks[i].dst, stats.atime, stats.mtime);
            // Backup finished.
            this.loggerService.log(`Backup of ${backupTasks[i].src} to ${backupTasks[i].dst} succeeded!`, this.constructor.name);
          } catch (err) {
            // Backup failed.
            failedTasks.push(backupTasks[i]);
            this.loggerService.error(`Backup of ${backupTasks[i].src} to ${backupTasks[i].dst} failed!`, this.constructor.name);
          }
        }
        // Log results.
        if (backupTasks.length > 0) {
          this.loggerService.log('Backup finished!', this.constructor.name);
          if (failedTasks.length > 0) {
            this.loggerService.warn(`The following tasks failed: ${failedTasks.map(t => `\n${t.src} > ${t.dst}`).reduce((acc, t) => acc += t)}`, this.constructor.name);
          } else {
            // Backup successfully -> Clear internal storage of sensors.
            try {
              this.loggerService.log('Configuring APDM Sensors and wiping data...', this.constructor.name);
              const config = JSON.parse(JSON.stringify(this.config));
              config.erase = true;
              configure(config); // Do not await this!
            } catch (error) {
              this.loggerService.error(`Failed to configure sensors after backup: ${error}`, this.constructor.name);
            }
            try {
              // Convert files.
              this.loggerService.log(`Starting APDM file conversion...`, this.constructor.name);
              await this.converter.convertDirectory(backupDirectory, devices.map(d => d.deviceId.toString()), targetDirectory);
              this.loggerService.log(`APDM file conversion successful!`, this.constructor.name);
            } catch (error) {
              this.loggerService.error(`Failed to convert .apdm to .h5 files: ${error}`, this.constructor.name);
            }
            notify({
              title: 'SSTeP-KiZ Backup',
              message: 'Backup der Bewegungssensoren abgeschlossen! Bewegungssensoren können nun entfernt werden',
              sound: true,
            });
          }
        } else {
          this.loggerService.debug('No files to backup', this.constructor.name);
        }
      } catch (error) {
        this.loggerService.error(`Backup failed: ${error}`, this.constructor.name);
        notify({
          title: 'SSTeP-KiZ Backup',
          message: 'Backup der Bewegungssensoren fehlgeschlagen!',
          sound: true,
        });
      }
    }
    // Indicate running backup process.
    this.processIsRunning = false;
  }

  /**
   * Starts the backup interval.
   * @param tempDirectory Directory to store raw data to.
   * @param targetDirectory Directory to store converted and synchronized sensor data to.
   * @param devices Array of available APDM devices.
   * @param interval Backup interval in ms.
   * @param configure Callback to configure sensors.
   */
  startWatching(tempDirectory: string, targetDirectory: string, devices: ApdmDevice[], interval: number, configure: (options: ApdmDriverConfiguration) => Promise<void>): void {
    // Cancel if interval is already running.
    if (this.backupInterval) {
      return;
    }
    // Set the interval.
    this.backupInterval = setInterval(() => {
      this.backupSensorData(tempDirectory, targetDirectory, devices, configure);
    }, interval);
  }
  /**
   * Stops the backup interval.
   */
  stopWatching(): void {
    if (this.backupInterval) {
      clearTimeout(this.backupInterval);
      this.backupInterval = undefined;
    }
  }
}
