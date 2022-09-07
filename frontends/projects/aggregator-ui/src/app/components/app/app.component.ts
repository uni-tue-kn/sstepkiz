import { Component } from '@angular/core';

import { AuthValidationService } from '../../services/auth-validation/auth-validation.service';
import { FullscreenService } from '../../services/fullscreen/fullscreen.service';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
})
export class AppComponent {

  /**
   * Indicates if app was in fullscreen before locking.
   */
  private inFullscreenBefore: boolean = false;

  _locked: boolean = false;
  /**
   * Gets if app is locked.
   */
  get locked(): boolean {
    return this._locked;
  }
  /**
   * Sets if app is locked.
   */
  set locked(value: boolean) {
    // Update value.
    this._locked = value;
    // Handle Fullscreen state.
    if (this.locked) {
      // Store if app was in fullscreen before locking.
      this.inFullscreenBefore = this.fullscreenService.fullscreenActive;
      // Switch to fullscreen if not in fullscreen.
      if (!this.inFullscreenBefore) {
        this.fullscreenService.requestFullscreen();
      }
    } else {
      // Switch back to non-fullscreen if not in fullscreen before locking.
      if (!this.inFullscreenBefore) {
        this.fullscreenService.exitFullscreen();
      }
    }
  }

  /**
   * Constructs a new App Component.
   * @param authValidation Authentication Validation Service instance.
   * @param fullscreenService Fullscreen Service instance.
   */
  constructor(
    readonly authValidation: AuthValidationService,
    private readonly fullscreenService: FullscreenService,
  ) {
    authValidation.startIntervalChecking();
  }

  get browserSupported(): boolean {
    return navigator.userAgent.includes('Chrome');
  }
}
