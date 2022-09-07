import { EventEmitter, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FullscreenService {

  /**
   * Gets if fullscreen mode is entered.
   */
  get fullscreenActive(): boolean {
    return this.fullscreenElement !== undefined && this.fullscreenElement !== null;
  }

  /**
   * Emits if fullscreen mode was entered or left.
   */
  readonly fullscreenActiveChange = new EventEmitter<boolean>();

  /**
   * Gets the fullscreen element or null if no element in fullscreen mode.
   */
  get fullscreenElement(): Element | null {
    if ('fullscreenElement' in document) {
      return document.fullscreenElement;
    }
    return null;
  }

  /**
   * Gets if fullscreen is available.
   */
  get fullscreenEnabled(): boolean {
    if ('fullscreenEnabled' in document) {
      return document.fullscreenEnabled;
    }
    return false;
  }

  /**
   * Constructs a new Fullscreen Service.
   */
  constructor() {
    // Subscribe changes of fullscreen mode.
    document.onfullscreenchange = (ev) => {
      this.fullscreenActiveChange.emit(this.fullscreenActive);
    }
  }

  /**
   * Escapes from fullscreen mode.
   */
  async exitFullscreen(): Promise<void> {
    if ('exitFullscreen' in document) {
      await document.exitFullscreen();
    }
  }

  /**
   * Requests to set element in fullscreen.
   * @param element DOM element to set in fullscreen or undefined if whole document should be requested for fullscreen.
   * @param options Options for fullscreen mode.
   */
  async requestFullscreen(element?: Element, options?: FullscreenOptions): Promise<void> {
    if (element === undefined) {
      element = document.documentElement;
    }
    if ('requestFullscreen' in element) {
      await element.requestFullscreen(options);
    }
  }
}
