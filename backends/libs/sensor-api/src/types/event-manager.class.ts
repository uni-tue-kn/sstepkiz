export type Listener = (...args: any[]) => void | Promise<void>;

export class EventManager<T extends string = string, L extends Listener = Listener> {
  /**
   * Mapping of events to listeners.
   */
  private readonly listeners: Map<T, Array<L>> = new Map<T, Array<L>>();

  /**
   * Removes all listeners.
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * Executes all listeners of an event.
   * @param event Event to fire.
   * @param args Arguments to pass to the listeners.
   */
  fire(event: T, ...args: any[]): void {
    if (!this.listeners.has(event)) {
      return;
    }
    const listeners = [...this.listeners.get(event)];
    listeners.forEach(l => {
      l(...args);
    });
  }

  /**
   * Unsubscribes an event.
   * @param event Event to unsubscribe.
   * @param listener Listener to unsubscribe.
   */
  off(event: T, listener: L): void {
    if (!this.listeners.has(event)) {
      return;
    }
    const listeners = this.listeners.get(event);
    const index = listeners.indexOf(listener);
    if (index < 0) {
      return;
    }
    listeners.splice(index, 1);
    if (listeners.length === 0) {
      this.listeners.delete(event);
    }
  }

  /**
   * Subscribes an event.
   * @param event Event to subscribe.
   * @param listener Listener to subscribe.
   */
  on(event: T, listener: L): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(listener);
  }
}
