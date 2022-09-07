import { LoggerService } from "@libs/logger";
import fs from 'fs';

import { ApdmDriverConfiguration } from "../drivers/apdm-driver-configuration.class";
import { ApdmConfig } from "./apdm-config.class";
import { ApdmServerInstance } from "./apdm-server-instance.class";

export class ApdmServerManager {

  /**
   * Current APDM Server instance.
   */
  private apdmServerInstance?: ApdmServerInstance = undefined;

  private _isConfiguring: boolean = false;
  /**
   * Gets if configuration is running.
   */
  get isConfiguring(): boolean {
    return this._isConfiguring;
  }

  private _isStreaming: boolean = false;
  /**
   * Gets if streaming process is running.
   */
  get isStreaming() {
    return this._isStreaming;
  }

  /**
   * Constructs a new APDM Server Manager.
   * @param config APDM configuration.
   * @param loggerService Logger Service.
   */
  constructor(
    private readonly config: ApdmConfig,
    private readonly loggerService: LoggerService
  ) {}

  /**
   * Writes a temporary configuration to a file.
   * @param filePath Path to file.
   * @param config Configuration to write.
   * @throws Errors when writing file.
   */
  private writeConfigFile(filePath: string, config: ApdmDriverConfiguration): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      fs.writeFile(
        filePath,
        JSON.stringify(config),
        { encoding: 'utf8' },
        (error) => {
          if (error) {
            reject(`Failed to write temporary configuration file to ${this.config.configFile}: ${error}`);
          } else {
            resolve();
          }
        }
      );
    });
  }

  /**
   * Configures the APDM sensors.
   * @param options Driver configuration options.
   * @throws When configuration is already in process.
   * @throws When configuration failed.
   */
  async configure(options: ApdmDriverConfiguration): Promise<void> {
    // Handle running APDM Server configuration instance.
    if (this.isConfiguring) {
      throw 'Configuration is already in process';
    }
    this._isConfiguring = true;
    try {
      // Handle running APDM Server instance.
      if (this.apdmServerInstance) {
        if (!this.apdmServerInstance.isRunning) {
          // Cleanup left APDM Server instance if no more running.
          this.apdmServerInstance = undefined;
        } else {
          switch (this.apdmServerInstance.mode) {
            case 'config': // Should never happen since this should be caught by _isConfiguring.
              throw 'Configuration is already in process. Unexpected state detected please contact developers!';
            case 'stream':
            default:
              // Kill running APDM Server streaming process.
              await this.apdmServerInstance.stop();
              break;
          }
        }
      }
      // Generate temporary configuration file.
      const configData = JSON.stringify(options);
      this.loggerService.debug(`Saving configuration "${configData}" for APDM Sensors to "${this.config.configFile}"...`, this.constructor.name);
      await this.writeConfigFile(this.config.configFile, options);
      this.loggerService.debug('Configuration successfully saved', this.constructor.name);
      // Configure sensors.
      this.apdmServerInstance = new ApdmServerInstance(this.config, 'config');
      // Subscribe events.
      this.apdmServerInstance.on('exit', (code, signal) => {
        this.loggerService.debug(`APDM Server stopped (code: ${code}, signal: ${signal})`, this.constructor.name);
        this.apdmServerInstance = undefined;
      });
      this.apdmServerInstance.on('message', message => {
        this.loggerService.log(message.toString(), 'APDM Server');
      });
      this.apdmServerInstance.on('error', error => {
        this.loggerService.error(`${error.name}: ${error.message}`, 'APDM Server');
      });
      this.apdmServerInstance.on('stdout', data => {
        this.loggerService.debug(`STDOUT: ${data}`, 'APDM Server');
      });
      this.apdmServerInstance.on('stderr', data => {
        this.loggerService.error(`STDERR: ${data}`, 'APDM Server');
      });
      // Start configuration.
      try {
        this.loggerService.debug(`Starting new APDM Server instance: ${JSON.stringify(this.apdmServerInstance)}`, this.constructor.name);
        await this.apdmServerInstance.start();
        this.loggerService.log('APDM Server configuration was stopped', this.constructor.name);
      } catch (error) {
        throw error;
      }
    } catch (error) {
      throw `APDM configuration failed: ${error}`;
    } finally {
      this._isConfiguring = false;
    }
  }

  /**
   * Starts the APDM Server streaming.
   */
  startStream(): Promise<void> {
    return new Promise(async resolve => {
      this._isStreaming = true;
      // Handle existing APDM Server instance.
      if (this.apdmServerInstance && this.apdmServerInstance.isRunning) {
        this.loggerService.debug(`Existing APDM Server instance found: ${JSON.stringify(this.apdmServerInstance)}`, this.constructor.name);
        switch (this.apdmServerInstance.mode) {
          case 'config':
            // Configuration in process -> Wait until termination to avoid broken configuration.
            this.loggerService.log('APDM Server is yet configuring, streaming will start after configuration has finished', this.constructor.name);
            await this.apdmServerInstance.termination();
            break;
          case 'stream':
          default:
            // Already streaming.
            this.loggerService.debug('APDM Server instance is already running', this.constructor.name);
            this._isStreaming = false;
            resolve();
            return;
        }
      }
      this.loggerService.debug(`Creating APDM Server instance in streaming mode...`, this.constructor.name);
      // Create a new APDM Server instance for streaming.
      this.apdmServerInstance = new ApdmServerInstance(this.config, 'stream');
      // Subscribe events.
      this.apdmServerInstance.on('exit', (code, signal) => {
        this.loggerService.debug(`APDM Server stopped (code: ${code}, signal: ${signal})`, this.constructor.name);
        this.apdmServerInstance = undefined;
      });
      this.apdmServerInstance.on('message', (message) => {
        // Resolve to indicate that starting was successful.
        resolve();
        this.loggerService.log(message.toString(), 'APDM Server');
      });
      this.apdmServerInstance.on('error', (error) => {
        this.loggerService.error(`${error.name}: ${error.message}`, 'APDM Server');
      });
      this.apdmServerInstance.on('stdout', data => {
        this.loggerService.debug(`STDOUT: ${data}`, 'APDM Server');
      });
      this.apdmServerInstance.on('stderr', data => {
        this.loggerService.error(`STDERR: ${data}`, 'APDM Server');
      });
      // Start APDM Server instance.
      try {
        this.loggerService.debug(`Starting new APDM Server instance: ${JSON.stringify(this.apdmServerInstance)}`, this.constructor.name);
        await this.apdmServerInstance.start();
        this.loggerService.log(`APDM Server streaming was stopped`, this.constructor.name);
      } catch (error) {
        this.loggerService.error(error, this.constructor.name);
        this.loggerService.log(`Restarting APDM Server in ${this.config.serverRestartTimeout} ms...`, this.constructor.name);
        // Restart server after timeout.
        setTimeout(() => {
          this.loggerService.debug('Restarting APDM Server instance...', this.constructor.name);
          this.startStream();
        }, this.config.serverRestartTimeout);
      } finally {
        this._isStreaming = false;
      }
    });
  }
  /**
   * Stops the APDM Server streaming.
   */
  stopStream(): Promise<void> {
    return new Promise<void>(async resolve => {
      // Stop APDM Server if running in streaming mode.
      if (this.apdmServerInstance && this.apdmServerInstance.isRunning && this.apdmServerInstance.mode === 'stream') {
        const stop = async () => {
          this.loggerService.debug('Stopping APDM Server streaming...', this.constructor.name);
          try {
            await this.apdmServerInstance.stop();
            return true;
          } catch (error) {
            // Retry termination until it works.
            this.loggerService.error(`Failed to stop APDM Server streaming: ${error} Retrying in 100 ms...`, this.constructor.name);
            return false;
          }
        };
        while (this.apdmServerInstance && this.apdmServerInstance.isRunning && !(await stop())) {
          this.loggerService.debug('Trying to stop APDM Server Instance...', this.constructor.name);
          // Wait 100 ms until retry.
          await new Promise<void>(resolve => {
            setTimeout(async () => {
              resolve();
            }, 100);
          });
        }
      } else {
        // Handle existing APDM Server instance.
        if (this.apdmServerInstance && !this.apdmServerInstance.isRunning) {
          this.apdmServerInstance = undefined;
        }
        this.loggerService.debug('APDM Server streaming already stopped', this.constructor.name);
      }
      resolve();
    });
  }

  /**
   * Waits for termination of APDM Server process.
   */
  async termination(): Promise<void> {
    if (this.apdmServerInstance) {
      await this.apdmServerInstance.termination();
    } else {
      return;
    }
  }
}
