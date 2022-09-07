import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

@Injectable()
export class SensorDataService {

  /**
   * Gets the directory where sensor data will be saved to.
   */
  get dataDirectory(): string {
    const dataDir = this.configService.get<string>('SENSOR_DIR', '~/sstepkiz');
    return this.toOsDir(dataDir);
  }

  /**
   * Converts any directory path to a Directory Path of the currently used operating system.
   * @param directory Directory path to convert.
   * @returns Converted path.
   */
  toOsDir(directory: string): string {
    const osSpecific = (directory: string): string => {
      switch (process.platform) {
        case 'linux':
        case 'darwin':
          // Get linux home and replace possible windows backslashes
          directory = directory.replace('~', process.env.HOME);
          directory = directory.split('\\').join('/')
          // Normalizing removes possible duplicate forward slashes
          return path.normalize(directory);
        case 'win32':
          // Replace home with the path to the windows user directory (Since both back and forward slashes are allowed, no replacement)
          directory = directory.replace('~', process.env.USERPROFILE);
          directory = directory.split('/').join('\\');
          return path.win32.normalize(directory);
        default:
          return directory;
      }
    };
    return osSpecific(directory).replace('<username>', os.userInfo().username);
  }

  /**
   * Constructs a new Sensor Data Service.
   * @param configService Configuration Service instance.
   */
  constructor(
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registers a sensor directory.
   * @param directoryName Name of sensor directory.
   * @returns Full path of directory.
   * @throws If directory creation or usage fails due to missing permissions.
   */
  async register(directoryName: string): Promise<string> {
    directoryName = directoryName.split('\\')[0].split('/')[0].replace('.', '');
    const dir = path.join(this.dataDirectory, directoryName);
    const exists = await new Promise<boolean>(resolve => {
      fs.access(dir, (error) => resolve(!error));
    });
    if (!exists) {
      await new Promise<void>((resolve, reject) => {
        fs.mkdir(dir, { recursive: true }, error => {
          if (error) {
            reject(`Failed to create directory "${dir}": ${error.message}`);
          } else {
            resolve();
          }
        });
      });
    }
    return dir;
  }
}
