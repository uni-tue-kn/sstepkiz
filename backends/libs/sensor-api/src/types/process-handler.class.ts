import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import path from 'path';
import os from 'os';

import { EventManager, Listener } from './event-manager.class';
import { sleep } from './sleep.function';

const TERMINATION_RETRY_TIME: number = 100;
const MAX_TERMINATION_TRIES: number = 10;
const TERMINATION_TIMEOUT: number = 1000;

export type ProcessEvents = 'exit' | 'message' | 'error' | 'stdout' | 'stderr';

export class ProcessHandler {
  /**
   * Gets if process is running.
   */
  get active(): boolean {
    return this.process && !this.process.killed;
  }

  /**
   * Manages process events.
   */
  private readonly listenerManager = new EventManager<ProcessEvents>();

  /**
   * Currently running child process or undefined if not running.
   */
  private process?: ChildProcessWithoutNullStreams = undefined;

  private readonly command: string;

  /**
   * 
   * @param command Command to execute.
   * @param params Command parameters.
   * @param workingDirectory Working directory of process.
   * @param priority Priority of process.
   */
  constructor(
    command: string,
    params: string[] = [],
    private readonly workingDirectory: string = process.cwd(),
    private readonly priority = 0,
  ) {
    this.command = `${command}${params.map(p => ` ${p}`).reduce((p, c) => `${p}${c}`)}`;
  }

  /**
   * Unsubscribes an event.
   * @param event Event to unsubscribe.
   * @param listener Listener to unsubscribe.
   */
  off(event: ProcessEvents, listener: Listener): void {
    this.listenerManager.off(event, listener);
  }

  /**
   * Subscribes an event.
   * @param event Event to subscribe.
   * @param listener Listener to subscribe.
   */
  on(event: ProcessEvents, listener: Listener): void {
    this.listenerManager.on(event, listener);
  }

  /**
   * Subscribes to process events.
   */
  private subscribeEvents() {
    this.process.on('error', error => {
      this.listenerManager.fire('error', error);
    });
    this.process.on('exit', (code, signal) => {
      this.listenerManager.fire('exit', code, signal);
    });
    this.process.on('message', message => {
      this.listenerManager.fire('message', message);
    });
    this.process.stderr.on('data', chunk => {
      this.listenerManager.fire('stderr', chunk);
    });
    this.process.stdout.on('data', chunk => {
      this.listenerManager.fire('stdout', chunk);
    });
  }

  /**
   * Starts the process and waits until it ends.
   * @throws Starting process failed.
   * @throws Process crashed.
   */
  async start(): Promise<void> {
    // Ensure that process is not yet running.
    if (this.process) {
      return;
    }
    await new Promise<void>((resolve, reject) => {
      try {
        // Start process.
        this.process = spawn(
          `${path.join(process.cwd(), this.command)}`,
          // this.params?.length > 0 ? this.params : undefined,
          { cwd: path.join(process.cwd(), this.workingDirectory) }
        );
        os.setPriority(this.process.pid, this.priority);
        // this.process.unref();
        // Subscribe to process events.
        this.subscribeEvents();
        // Subscribe to exit event.
        this.listenerManager.on('exit', (code: number, signal: NodeJS.Signals) => {
          if (code <= 0x7FFFFFFF || signal === 'SIGTERM') {
            // Positive exit code or terminated.
            this.process = undefined;
            this.listenerManager.clear();
            resolve();
            return;
          } else {
            // Process failed.
            this.process = undefined;
            this.listenerManager.clear();
            reject(`Process terminated with error code ${code} and signal ${signal}`);
            return;
          }
        });
      } catch (error) {
        // spawn() method failed.
        this.process = undefined;
        this.listenerManager.clear();
        reject(`Starting process "${this.command}" failed: ${error}`);
        return;
      }
    });
  }

  /**
   * Stops the process.
   * @throws Termination timed out.
   * @throws Killing process failed.
   */
  async stop(): Promise<void> {
    // Check if process is still running.
    if (!this.process) {
      return;
    }
    try {
      let t = 0;
      for (t = 1; this.active && !this.process.kill('SIGTERM') && t <= MAX_TERMINATION_TRIES; t++) {
        // Give process time to terminate.
        await sleep(TERMINATION_RETRY_TIME);
      }
      // Wait for process termination or throw after timeout.
      await Promise.race([
        this.termination(),
        sleep(TERMINATION_TIMEOUT).then(() => {
          throw `Process termination timed out after ${t} tries!`;
        }),
      ]);
    } catch (error) {
      throw `Failed to stop process: ${error}`;
    }
  }

  /**
   * Waits for process termination.
   */
  async termination(): Promise<void> {
    await new Promise<void>(resolve => {
      if (!this.process || this.process.killed) {
        // Process either not started or already terminated.
        resolve();
      } else {
        this.listenerManager.on('exit', () => resolve());
      }
    });
  }
}
