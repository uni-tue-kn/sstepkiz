/**
 * Generates a promise which resolves on first emit of an event that matches some optional constraints.
 * @param target Target object which emits the event.
 * @param type Type of event.
 * @param constraint Optional constraint method which must return true before promise resolves.
 * @returns Event which was emitted by the target object.
 */
 export async function eventToPromise<T extends Event>(target: EventTarget, type: string, constraint?: (ev: T) => boolean): Promise<T> {
  return await new Promise<T>((resolve) => {
    // Prepare callback for the event.
    const callback = (ev: T) => {
      // Verify if event matches constraints if given.
      if (!constraint || constraint(ev)) {
        // Stop listening to the event.
        target.removeEventListener(type, callback);
        // Resolve the emitted event.
        resolve(ev);
      }
    };
    // Start listening to the event.
    target.addEventListener(type, callback);
  });
}
