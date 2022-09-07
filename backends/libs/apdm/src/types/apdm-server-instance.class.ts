import { ChildProcessWithoutNullStreams, spawn } from "child_process";

import { ApdmConfig } from "./apdm-config.class";

export type ApdmServerMode = 'config' | 'stream';

export class ApdmServerInstance {

  /**
   * Gets if server process is still running.
   */
  get isRunning(): boolean {
    return this.serverProcess && !this.serverProcess.killed;
  }

  /**
   * Instance of currently running APDM Server process.
   */
  private serverProcess?: ChildProcessWithoutNullStreams = undefined;

   /**
   * Gets the start parameters of the APDM Server process depending on the preferred mode.
   */
  private get startParams(): string[] {
    switch (this.mode) {
      case 'config':
        return this.config.serverConfigParams;
      case 'stream':
        return this.config.serverInitParams;
      default:
        return [];
    }
  }

  private readonly eventListeners: {
    [event: string]: ((...args: any[]) => void | Promise<void>)[],
  } = {};

  /**
   * Constructs a new APDM Server instance.
   * @param config APDM Server configuration.
   * @param mode Preferred mode.
   */
  constructor(
    private readonly config: ApdmConfig,
    readonly mode: ApdmServerMode,
  ) {}

  on(event: 'exit' | 'message' | 'error' | 'stdout' | 'stderr', listener: (...args: any[]) => void | Promise<void>): void {
    if (!(event in this.eventListeners)) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(listener);
  }

  private subscribeEvents() {
    if (!this.serverProcess) {
      return;
    }
    this.eventListeners.exit.forEach(l => {
      this.serverProcess.on('exit', l);
    });
    this.eventListeners.error.forEach(l => {
      this.serverProcess.on('error', l);
    });
    this.eventListeners.message.forEach(l => {
      this.serverProcess.on('message', l);
    });
    this.eventListeners.stdout.forEach(l => {
      this.serverProcess.stdout.on('data', l);
    });
    this.eventListeners.stderr.forEach(l => {
      this.serverProcess.stderr.on('data', l);
    })
  }

  /**
   * Starts the APDM Server process in the preferred mode and waits for process termination.
   * @throws Throws an error when the process terminated with an error or when process cannot be started.
   */
  start(): Promise<void> {
    if (this.serverProcess) {
      // Server process is already running.
      return;
    }
    return new Promise<void>((resolve, reject) => {
      try {
        // Start server process detached.
        this.serverProcess = spawn(
          this.config.serverApplication,
          this.startParams,
          {
            detached: true,
          }
        );
        this.subscribeEvents();
        // Subscribe to exit event to keep track of process termination.
        this.serverProcess.on('exit', (code, signal) => {
          if (code <= 0x7FFFFFFF || signal === 'SIGSTOP' || signal == 'SIGTERM') {
            // APDM Server either terminated successfully or was killed.
            this.serverProcess = undefined;
            resolve();
          } else {
            // APDM Server stopped unexpected.
            this.serverProcess = undefined;
            reject(`Server process terminated with error code ${code} and signal ${signal}`);
          }
        });
      } catch (error) {
        reject(`Failed to start APDM Server process: ${error}`);
        this.serverProcess = undefined;
        return;
      }
    });
  }
  /**
   * Stops the APDM Server process with SIGSTOP.
   * If it fails, the APDM Server process will be forced to terminate with SIGTERM.
   * @throws Throws an error when APDM Server process termination failed.
   */
  async stop(): Promise<void> {
    if (!this.serverProcess) {
      // Server process is not running.
      return;
    }
    // Create sleep method.
    const sleep = (time: number) => new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
    try {
      // Stop server process friendly.
      if (this.serverProcess.kill('SIGTERM')) {
        await this.termination();
      } else {
        // Give the server process 100 ms time to stop.
        await sleep(100);
        let tryNumber = 1;
        // Force termination of server process until stopped.
        while (this.serverProcess && !this.serverProcess.killed && !this.serverProcess.kill('SIGTERM')) {
          if (tryNumber > 10) {
            throw 'Failed to kill APDM server process!';
          } else {
            tryNumber++;
          }
          // Give the server process 10 ms time to terminate.
          await sleep(10);
        }
      }
    } catch (error) {
      throw `Failed to stop APDM server process: ${error}`;
    }
  }

  /**
   * Waits for termination of APDM Server process.
   */
   termination(): Promise<void> {
    return new Promise<void>(resolve => {
      if (this.serverProcess) {
        this.serverProcess.on('exit', () => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
