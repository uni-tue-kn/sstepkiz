import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-unlock-button',
  styleUrls: ['./unlock-button.component.scss'],
  templateUrl: './unlock-button.component.html'
})
export class UnlockButtonComponent {

  /**
   * Interval that updates the unlock progress spinner.
   */
  private interval: number;

  /**
   * Indicates if button is held down.
   */
  isDown: boolean = false;

  private _locked: boolean = true;
  /**
   * Gets if button is locked.
   */
  get locked(): boolean {
    return this._locked;
  }
  /**
   * Sets if button is locked.
   */
  @Input()
   set locked(value: boolean) {
    if (value === this._locked) return;
    this._locked = value;
    this.lockedChange.emit(value);
  }
  /**
   * Emits changed lock state.
   */
  @Output()
  readonly lockedChange = new EventEmitter<boolean>();

  /**
   * Current progress of unlocking the button on scale of 0 to 100.
   */
  progress: number = 0;

  /**
   * Unix timestamp when button was held down.
   */
  private startTime: number = undefined;

  /**
   * Timer which unlocks the button.
   */
  private timer: number;

  /**
   * Time to unlock the button.
   */
  @Input()
  unlockTime: number = 3000;

  /**
   * Computes the current unlock progress.
   * @returns Current progress on scale of 0 to 100.
   */
  computeProgress(): number {
    if (this.startTime === undefined) {
      return 0;
    } else {
      const now = Date.now();
      const difference = (now - this.startTime);
      const percentage = difference / this.unlockTime;
      const normalizedPercentage = Math.min(percentage, 1);
      return normalizedPercentage * 100;
    }
  }

  /**
   * Locks the button.
   */
  lock() {
    this.locked = true;
    this.progress = 0;
  }

  /**
   * Handles button down action.
   */
  onDown() {
    if (this.locked) {
      this.isDown = true;
      this.timer = setTimeout(() => {
        this.unlock();
      }, this.unlockTime);
      this.interval = setInterval(() => {
        this.progress = this.computeProgress();
      }, 1000 / 60);
      this.startTime = Date.now();
    } else {
      this.lock();
    }
  }

  /**
   * Handles button up action.
   */
  onUp() {
    clearTimeout(this.timer);
    clearInterval(this.interval);
    this.isDown = false;
    this.locked = true;
    this.startTime = undefined;
    this.progress = this.locked ? 0 : 100;
  }

  /**
   * Unlocks the button.
   */
  unlock() {
    this.locked = false;
    this.progress = 100;
  }
}
