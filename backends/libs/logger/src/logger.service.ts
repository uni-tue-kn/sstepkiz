import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService extends ConsoleLogger {
  /**
   * Selected debug function.
   */
  private debugFunction: (message: string, trace?: string) => void = super
    .debug;

  /**
   * Function that does absolutely nothing.
   */
  private readonly emptyFunction: (
    message: string,
    trace?: string,
  ) => void = () => {};

  /**
   * Selected error function.
   */
  private errorFunction: (message: string, trace?: string) => void = super
    .error;

  /**
   * Selected log function.
   */
  private logFunction: (message: string, trace?: string) => void = super.log;

  private _logLevel = 5;
  /**
   * Gets the current log level.
   * 5 = Verbose.
   * 4 = Debug.
   * 3 = Normal.
   * 2 = Warnings.
   * 1 = Errors.
   * 0 = None.
   */
  get logLevel(): number {
    return this._logLevel;
  }
  /**
   * Sets the log level.
   * 5 = Verbose.
   * 4 = Debug.
   * 3 = Normal.
   * 2 = Warnings.
   * 1 = Errors.
   * 0 = None.
   */
  set logLevel(value: number) {
    // Set logLevel on 0 <= logLevel <= 5.
    this._logLevel = value > 5 ? 5 : value < 0 ? 0 : value;

    // Reset the functions.
    this.verboseFunction =
      this.logLevel >= 5 ? super.verbose : this.emptyFunction;
    this.debugFunction = this.logLevel >= 4 ? super.debug : this.emptyFunction;
    this.logFunction = this.logLevel >= 3 ? super.log : this.emptyFunction;
    this.warnFunction = this.logLevel >= 2 ? super.warn : this.emptyFunction;
    this.errorFunction = this.logLevel >= 1 ? super.error : this.emptyFunction;
  }

  /**
   * Selected verbose function.
   */
  private verboseFunction: (message: string, trace?: string) => void = super
    .verbose;

  /**
   * Selected warn function.
   */
  private warnFunction: (message: string, trace?: string) => void = super.warn;

  /**
   * Constructs a new app logger.
   * @param context Context of logger.
   * @param isTimestampEnabled If timestamps should be enabled.
   */
  constructor(context?: string, isTimestampEnabled?: boolean) {
    super(context, { timestamp: isTimestampEnabled });
    this.logLevel = 5;
  }

  /**
   * Logs a debug message.
   * @param message Message to log.
   * @param trace Trace to log.
   */
  debug(message: string, trace?: string): void {
    this.debugFunction(message, trace);
  }

  /**
   * Logs an error message.
   * @param message Message to log.
   * @param trace Trace to log.
   */
  error(message: string, trace?: string): void {
    this.errorFunction(message, trace);
  }

  /**
   * Logs a log message.
   * @param message Message to log.
   * @param trace Trace to log.
   */
  log(message: string, trace?: string): void {
    this.logFunction(message, trace);
  }

  /**
   * Logs a verbose message.
   * @param message Message to log.
   * @param trace Trace to log.
   */
  verbose(message: string, trace?: string): void {
    this.verboseFunction(message, trace);
  }

  /**
   * Logs a warn message.
   * @param message Message to log.
   * @param trace Trace to log.
   */
  warn(message: string, trace?: string): void {
    this.warnFunction(message, trace);
  }
}
