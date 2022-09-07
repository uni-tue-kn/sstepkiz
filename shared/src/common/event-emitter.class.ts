export class EventEmitter {

  /**
   * Internal storage for listeners.
   */
  private listeners: { [event: string]: ((...args: any[]) => void | Promise<void>)[] } = {};

  /**
   * Adds an event listener.
   * @param event Name of event.
   * @param listener Listener callback to add.
   */
  addListener(event: string | number, listener: (...args: any[]) => void | Promise<void>): void {
    if (!(event in this.listeners)) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  /**
   * Emits an event.
   * @param event Name of event.
   * @param args Arguments for the listeners.
   */
  async emit(event: string | number, ...args: any[]): Promise<void> {
    if (!(event in this.listeners)) {
      return;
    }
    const listeners = this.listeners[event].slice();
    if (listeners.length === 0) {
      return;
    }
    const errors: any[] = [];
    await Promise.all(
      listeners.map(l => {
        return new Promise<void>(async resolve => {
          try {
            await l(...args);
            resolve();
          } catch (error) {
            errors.push(error);
            resolve();
          }
        })
      })
    );
    if (errors.length > 0) {
      throw errors;
    }
  }

  /**
   * Removes all listeners of a given event or all listeners from all events, if no event name given.
   * @param event Optional name of event.
   */
  removeAllListeners(event?: string | number): void {
    if (event) {
      if (event in this.listeners) {
        delete this.listeners[event];
      }
    } else {
      this.listeners = {};
    }
  }

  /**
   * Removes a listener callback from an event.
   * @param event Name of event.
   * @param listener Listener callback to remove.
   */
  removeListener(event: string | number, listener: (...args: any[]) => void | Promise<void>): void {
    if (!(event in this.listeners)) {
      return;
    }

    const index = this.listeners[event].indexOf(listener);
    if (index < 0) {
      return;
    }

    this.listeners[event].splice(index, 1);
    if (this.listeners[event].length === 0) {
      delete this.listeners[event];
    }
  }
}
