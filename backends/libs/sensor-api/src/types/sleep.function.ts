/**
 * Waits a specified time.
 * @param time Time to wait in ms.
 */
export async function sleep(time: number): Promise<void> {
  await new Promise<void>(resolve => {
    setTimeout(() => resolve(), time);
  });
}
