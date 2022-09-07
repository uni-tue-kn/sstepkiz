import { EventManager } from '@libs/sensor-api/types/event-manager.class';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

type CsvLoggerEncodings = 'utf8' | 'ascii' | 'base64';

export class CsvLogger {

  private readonly emitter = new EventManager<'ended', () => any>();
  private ending: boolean = false;
  private writeStream: fs.WriteStream;

  constructor(
    readonly path: fs.PathLike,
    readonly encoding: CsvLoggerEncodings,
    readonly separator: string = ',',
  ) {
    this.writeStream = fs.createWriteStream(
      this.path,
      { encoding: this.encoding }
    );
  }

  addEventListener(event: 'ended', callback: () => any): void {
    this.emitter.on(event, callback);
  }
  removeEventListener(event: 'ended', callback: () => any): void {
    this.emitter.off(event, callback);
  }

  async end(): Promise<void> {
    this.ending = true;
    await new Promise<void>(resolve => {
      this.writeStream.end(() => {
        resolve();
        this.emitter.fire('ended');
      });
    });
    this.writeStream = undefined;
  }

  write(data: Array<string | number>): void {
    if (this.ending || !this.writeStream) return;
    var line = data.reduce((prev, curr) => `${prev}${this.separator}${curr}`);
    line=line+',\n';
    this.writeStream.write(line);
  }
}

@Injectable()
export class CsvLoggerService {

  private readonly activeLoggers: { [path: string]: CsvLogger } = {};

  create(path: string, columnNames?: string[]): CsvLogger {
    if (!(path in this.activeLoggers)) {
      const logger = new CsvLogger(path, 'utf8', ',');
      const onEnded = () => {
        logger.removeEventListener('ended', onEnded);
        delete this.activeLoggers[path];
      };
      logger.addEventListener('ended', onEnded);
      this.activeLoggers[path] = logger;
      if (columnNames) {
        logger.write(columnNames);
      }
    }
    return this.activeLoggers[path];
  }

  async endAll(): Promise<void> {
    const paths = Object.getOwnPropertyNames(this.activeLoggers);
    const loggers = paths.map(p => this.activeLoggers[p]);
    try {
      await Promise.all(
        loggers.map(l => l.end())
      );
    } catch (error) {
      `Failed to end all CSV loggers: ${JSON.stringify(error)}`;
    }
  }
}
