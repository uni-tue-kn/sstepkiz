import { ProcessHandler } from "@libs/sensor-api";
import path from 'path';

export class LookProcessHandler extends ProcessHandler {

  /**
   * Constructs a new process handler for the Look software.
   * @param executable Path to Look executable.
   * @param startParams Start parameters or Look software.
   * @param priority Priority of process.
   */
  constructor(executable: string, startParams: string[] = [], priority = 0) {
    super(executable, startParams, path.dirname(executable), priority);
  }
}
