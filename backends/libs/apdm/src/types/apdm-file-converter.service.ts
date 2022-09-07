import { LoggerService } from "@libs/logger";
import { EventManager, TimeConverter } from "@libs/sensor-api";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { spawn } from "child_process";
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import { ApdmConfig } from './apdm-config.class';

/**
 * Prefix of converted target files.
 */
const TARGET_FILE_PREFIX = 'apdm_mov_';

/**
 * Asynchronously reads a directory.
 */
const readDirAsync = promisify(fs.readdir);
/**
 * Asynchronously reads information about a file.
 */
const statAsync = promisify(fs.stat);
/**
 * Deletes a file asynchronously.
 */
const unlinkAsync = promisify(fs.unlink);

/**
 * Mapping of file converter event names to callback attributes.
 */
interface ApdmFileConverterEventMap {
  'success': [ task: ConversionTask ];
  'error': [ task: ConversionTask, error: string ];
  'finished': [ task: ConversionTask, error?: string ];
  'ended': [ failedTasks: Array<ConversionTask> ];
}

interface ApdmRawFileInfo {

  /**
   * Unix timestamp when the recording ended.
   */
  end: number;

  /**
   * Full file path of raw data file.
   */
  path: string;

  /**
   * Unix timestamp when the recording started.
   */
  start: number;
}

interface ApdmRawFileMatch {

  /**
   * Array of information about raw data files.
   */
  files: ApdmRawFileInfo[];

  /**
   * Unix timestamp when all the files start matching.
   */
  start: number;
}

interface ApdmRawSensorDataInfo {

  /**
   * Array of information about raw data files.
   */
  files: ApdmRawFileInfo[];

  /**
   * Identity of sensor which generated the raw data files.
   */
  sensor: string;
}

interface ConversionTask {

  /**
   * Full file path of converted file.
   */
  dst: string;

  /**
   * Array of full file paths of raw data files.
   */
  src: Array<string>;
};

export class ApdmFileConverterService {

  /**
   * Queue of conversion tasks.
   */
  private readonly _queue: Array<ConversionTask> = [];
  /**
   * Gets the queue of conversion tasks.
   */
  get queue(): Array<ConversionTask> {
    return [ ...this._queue ];
  }

  /**
   * Mapping of failed 
   */
  private readonly _failures: { [file: string]: number } = {};
  /**
   * Gets an array of failed conversions.
   */
  get failures(): { [file: string]: number } {
    return { ...this._failures };
  }

  /**
   * Mapping of scanned file paths to number of conversion.
   */
  private readonly _convertedFiles: { [file: string]: number } = {};
  /**
   * Gets a mapping of scanned file paths to number of conversion.
   */
  get convertedFiles(): { [file: string]: number } {
    return { ...this._convertedFiles };
  }

  /**
   * Indicates if conversion is paused.
   */
  private pauseConversion = false;

  /**
   * Manages events.
   */
  private readonly event = new EventManager();

  /**
   * Constructs a new APDM file converter.
   * @param loggerService Logger Service instance.
   */
  constructor (
    private readonly config: ApdmConfig,
    private readonly loggerService: LoggerService,
  ) { }

  /**
   * Emits an event.
   * @param event Event to emit.
   * @param args Arguments fo the event.
   */
  private emit<K extends keyof ApdmFileConverterEventMap>(event: K, ...args: ApdmFileConverterEventMap[K]) {
    this.event.fire(event, ...args);
  }
  /**
   * Starts listening to an event.
   * @param event Name of event.
   * @param callback Callback of event.
   */
  addEventListener<K extends keyof ApdmFileConverterEventMap>(event: K, callback: (...args: ApdmFileConverterEventMap[K]) => any) {
    this.event.on(event, callback);
  }
  /**
   * Stops listening to an event.
   * @param event Name of event.
   * @param callback Callback of event.
   */
  removeEventListener<K extends keyof ApdmFileConverterEventMap>(event: K, callback: (...args: ApdmFileConverterEventMap[K]) => any) {
    this.event.off(event, callback);
  }

  /**
   * Clears failed and converted files.
   */
  clearStats(): void {
    Object.getOwnPropertyNames(this._failures).forEach(k => {
      delete this._failures[k];
    });
    Object.getOwnPropertyNames(this._convertedFiles).forEach(k => {
      delete this._convertedFiles[k];
    });
  }

  /**
   * Starts or resumes the current conversion queue.
   */
  async start(): Promise<void> {
    const failedTasks: Array<ConversionTask> = [];
    // Ensure that conversion is not paused.
    this.pauseConversion = false;
    // Run the conversion queue until empty or conversion was stopped.
    while (this._queue.length > 0 || this.pauseConversion) {
      // Dequeue the next task.
      const task = this._queue.shift();
      try {
        // Convert the current task.
        await this.convert(task.src, task.dst);
        // Notify listeners.
        this.emit('success', task);
        this.emit('finished', task, undefined);
      } catch (error) {
        // Log error.
        this.loggerService.error(`Failed to convert APDM files ${JSON.stringify(task.src)} to ${task.dst}: ${error}`);
        // Add task to failed conversion tasks.
        task.src.forEach(f => {
          if (!(f in this._failures)) {
            this._failures[f] = 0;
          }
          this._failures[f]++;
        });
        failedTasks.push(task);
        // Notify listeners.
        this.emit('error', task, error);
        this.emit('finished', task, error);
      }
    }
    this.emit('ended', failedTasks);
  }
  /**
   * Pauses the conversion queue after finishing the current conversion.
   */
  async pause(): Promise<void> {
    this.pauseConversion = true;
    await new Promise<void>((resolve) => {
      const onFinished = () => {
        this.removeEventListener('finished', onFinished);
        resolve();
      }
      this.addEventListener('finished', onFinished);
    });
  }
  /**
   * Stops the conversion queue after finishing the current conversion and clear the queue.
   */
  async stop(): Promise<void> {
    await this.pause();
    this._queue.length = 0;
  }

  /**
   * Defines conversion tasks based on matching raw data files.
   * @param matches Matching raw data files.
   * @param targetDirectory Path of directory to store converted files.
   * @returns Conversion tasks.
   */
  private defineConversionTasks(matches: ApdmRawFileMatch[], targetDirectory: string): ConversionTask[] {
    return matches.map<ConversionTask>((match) => {
      const sourceFiles = match.files.map(f => f.path);
      const startTimeString = TimeConverter.getYYYYMMDDhhmmssuuuUTC(new Date(match.start));
      const targetFileName = path.join(targetDirectory, `${TARGET_FILE_PREFIX}${startTimeString}.h5`);
      this.loggerService.debug(`Defining conversion task ${JSON.stringify(sourceFiles)} -> ${targetFileName}`, this.constructor.name);
      return {
        src: sourceFiles,
        dst: targetFileName,
      };
    });
  }  
  /**
   * Discovers raw data files.
   * @param directory Parent directory of raw data files.
   * @param sensors Array of identities of sensors.
   * @returns Array of information about sensors and their raw data files.
   */
  private async discoverRawFiles(directory: string, sensors: string[]): Promise<ApdmRawSensorDataInfo[]> {
    const result = await Promise.all(sensors.map<Promise<ApdmRawSensorDataInfo>>(
      async (sensorName) => {
        // Generate full path of sensor directory.
        const fullPath = path.join(directory, sensorName);

        // Get contained raw data files.
        const children = await readDirAsync(fullPath, { withFileTypes: true });
        const apdmFiles = children.filter(f => f.isFile() && f.name.endsWith('.apdm'));

        // Generates array of raw data file infos.
        const fileInfos = await Promise.all(apdmFiles.map<Promise<ApdmRawFileInfo>>(
          async (file) => {
            // Generate full path of raw data file.
            const filePath = path.join(fullPath, file.name);
            // Index the file.
            if (!(filePath in this._convertedFiles)) {
              this._convertedFiles[filePath] = 0;
            }

            // Compute creation time as UTC timestamp.
            const dateString = file.name.substr(15, 19);
            const dateArray = dateString.split(/\.|\-/, 6).map(x => Number.parseInt(x));
            const creationTimeUtc = Date.UTC(
              dateArray[0],     // Year.
              dateArray[1] - 1, // Month. In JavaScript, Months start with 0 -> https://stackoverflow.com/questions/12254333/javascript-is-creating-date-wrong-month
              dateArray[2],     // Day.     
              dateArray[3],     // Hour.
              dateArray[4],     // Minute.
              dateArray[5]      // Second.
            );

            // Get information about raw file.
            const stats = await statAsync(filePath);

            // Compute last modification time as UTC timestamp.
            const modificationTimeUtc = stats.mtimeMs - (new Date()).getTimezoneOffset() * 60 * 1000;

            // Return info about raw data file.
            return {
              end: modificationTimeUtc,
              path: filePath,
              start: creationTimeUtc,
            };
          }
        ));

        // Return info about raw data of sensors.
        return {
          files: fileInfos,
          sensor: sensorName,
        };
      }
    ));
    return result;
  }
  /**
   * Finds matching raw data files.
   * @param sensors Information about sensors and their raw data files.
   * @returns Array of matching raw data files.
   */
  private async findMatchingRawData(sensors: ApdmRawSensorDataInfo[]): Promise<Array<ApdmRawFileMatch>> {
    // Sort files for each sensor by start interval.
    const sortedIntervals: Array<Array<ApdmRawFileInfo>> = sensors.map(sensor => {
      return [ ...sensor.files ].sort((a, b) => a.start - b.start);
    });

    /**
     * Computes the index of the element which starts next.
     * @returns Index of next starting element.
     */
    const indexOfNext = () => indexes.reduce((prevIndex, currIndex) => {
      // Get previous interval.
      // Keep in mind, that 'prevIndex' could be undefined if previous reduce operation returned undefined.
      const previous = prevIndex === undefined ? undefined : sortedIntervals[prevIndex][0];
      // Get current interval.
      const current = sortedIntervals[currIndex][0];
      // Determine result.
      if (previous !== undefined && current !== undefined) {
        // Return index of sensor whose next interval starts first.
        return previous.start < current.start ? prevIndex : currIndex;
      } else if (current !== undefined) {
        // Return index of current sensor since the previous sensor has no intervals left.
        return currIndex;
      } else if (previous !== undefined) {
        // Return index of previous sensor since the current sensor has no intervals left.
        return prevIndex;
      } else {
        // Return undefined since neither the current sensor nor the previous sensor has any intervals left.
        return undefined;
      }
    });

    // Prepare output result.
    const result: Array<ApdmRawFileMatch> = [];
    // Get available sensor indexes.
    const indexes: number[] = sortedIntervals.map((_, index) => index);
    // Prepare array of active indexes.
    let activeIndexes: number[] = [];
    // Compute index of next starting interval.
    let nextIndex: number | undefined = indexOfNext();
    // Prepare mapping of sensor indexes to active interval.
    const activeIntervals: { [index: number]: ApdmRawFileInfo } = {};

    // Do sweep-line algorithm until there is no next index found, which indicates that there are no interval left to process.
    while (nextIndex !== undefined) {
      // Put the next interval out of the sorted intervals.
      const nextInterval = sortedIntervals[nextIndex].shift();

      // Remove all intervals from active intervals which end before the next interval starts.
      activeIndexes.forEach(i => {
        if (nextInterval.start > activeIntervals[i].end) {
          delete activeIntervals[i];
        }
      });
      // Add the next interval to active intervals.
      activeIntervals[nextIndex] = nextInterval;

      // Get indexes of active time intervals.
      activeIndexes = Object.getOwnPropertyNames(activeIntervals).map(name => Number.parseInt(name));
      // Check if there is an active interval for each sensor.
      if (activeIndexes.length === sortedIntervals.length) {
        // Extract the raw file infos about the matching files.
        const matchFiles = activeIndexes.map<ApdmRawFileInfo>(i => activeIntervals[i]);
        // Since this match was completed by the nextInterval, the start of nextInterval is also the start of this match.
        const matchStart = nextInterval.start;
        // Add active intervals as a match to the result.
        const match: ApdmRawFileMatch = {
          files: matchFiles,
          start: matchStart, 
        };
        result.push(match);
      }

      // Update the index of the sensor of the next interval.
      nextIndex = indexOfNext();
    }

    // Return the final result.
    return result;
  }

  /**
   * Discovers matching raw data files, converts them to HDF5 and optionally deletes raw data files afterwards.
   * @param sourceDirectory Path of directory with raw sensor data files in directories matching the sensor identities.
   * @param sensors Identities of sensors to convert.
   * @param targetDirectory Path of directory to store converted files.
   */
  async convertDirectory(sourceDirectory: string, sensors: string[], targetDirectory: string): Promise<void> {
    // Discover raw data files.
    const sensorFileInfo = await this.discoverRawFiles(sourceDirectory, sensors);
    // Find matches of recording intervals between discovered data files.
    const matches = await this.findMatchingRawData(sensorFileInfo);
    // Define conversion tasks for matching files and optionally deletes them after conversion.
    const tasks = this.defineConversionTasks(matches, targetDirectory);
    // Add conversion tasks to queue.
    this._queue.push(...tasks);
    // Start and await conversion queue.
    await this.start();
    // Delete raw data files whose conversion did not fail.
    const failures = this.failures;
    if (this.config.deleteRaw) {
      this.loggerService.debug(`Deleting raw files... ${JSON.stringify(sensorFileInfo)}}`, this.constructor.name);
      for (let sensor of sensorFileInfo) {
        for (let file of sensor.files) {
          if (!(file.path in failures) || failures[file.path] === 0) {
            this.loggerService.debug(`Deleting ${file.path}...`, this.constructor.name);
            await unlinkAsync(file.path);
          }
        }
      }
      this.loggerService.debug(`Raw files deleted`, this.constructor.name);
    }
  }

  /**
   * Converts raw data files (.apdm) to HDF5 files (.h5).
   * @param sourceFiles Array of raw data files to convert.
   * @param destinationFile Path of converted destination file.
   * @throws When conversion failed.
   */
  private async convert(sourceFiles: string[], destinationFile: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const parameters = [ ...this.config.serverConvertParams, ...sourceFiles, destinationFile ];
      this.loggerService.debug(`Converting: ${this.config.serverApplication} ${parameters.reduce((p, c) => `${p} ${c}`)}`);
      const convertInstance = spawn(
        this.config.serverApplication,
        parameters,
        { detached: false }
      );
      const onMessage = (message) => {
        this.loggerService.debug(`Received message: ${message.toString()}`, 'APDM Server (convert)');
      };
      convertInstance.on('message', onMessage);
      convertInstance.on('error', onMessage);
      convertInstance.stderr.on('data', onMessage);
      convertInstance.stdout.on('data', onMessage);
      convertInstance.on('exit', (code, signal) => {
        this.loggerService.debug(`Conversion process finished with code ${code.toString(16)} and signal ${signal}`);
        convertInstance.off('message', onMessage);
        convertInstance.off('data', onMessage);
        if (code === 0) {
          // Mark files as converted.
          sourceFiles.forEach(f => {
            if (!(f in this._convertedFiles)) {
              this._convertedFiles[f] = 0;
            }
            this._convertedFiles[f]++;
          });
          resolve();
        } else {
          reject(`Failed to convert files. Code: ${code}`);
        }
      });
    });
  }
}
