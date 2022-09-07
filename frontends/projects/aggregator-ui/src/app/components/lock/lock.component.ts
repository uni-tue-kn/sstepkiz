import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-lock',
  styleUrls: ['./lock.component.scss'],
  templateUrl: './lock.component.html',
})
export class LockComponent implements OnDestroy, OnInit {

  private _locked: boolean = true;
  /**
   * Sets if screen is locked.
   */
  get locked(): boolean {
    return this._locked;
  }
  /**
   * Sets if screen is locked.
   */
  @Input()
  set locked(value: boolean) {
    if (value === this._locked) return;
    this._locked = value;
    this.lockedChange.emit(value);
  }
  /**
   * Emits changes of lock state.
   */
  @Output()
  readonly lockedChange = new EventEmitter<boolean>();

  /**
   * Indicates if lock button 1 (top right) is locked.
   */
  locked1: boolean = true;
  /**
   * Indicates if lock button 2 (bottom left) is locked.
   */
  locked2: boolean = true;

  /**
   * Callback of changed keyboard state.
   * @param event Keyboard event.
   */
  private readonly onKeyDown = (event: KeyboardEvent) => {
    // Unlock if CTRL + DEL is pressed.
    if (event.ctrlKey && event.key === 'Delete') {
      this.onUnlocked();
    }
  };

  /**
   * Time in ms to hold buttons to unlock.
   */
  @Input()
  unlockTime: number = 3000;
 
  /**
   * Checks if both lock buttons are unlocked.
   */
  checkLocked(): void {
    // Unlock if button 1 and button 2 are locked.
    if (!this.locked1 && !this.locked2) {
      this.onUnlocked();
    }
  }

  /**
   * Destroys the lock component.
   */
  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  /**
   * Initializes the lock component.
   */
  ngOnInit(): void {
    window.addEventListener('keydown', this.onKeyDown);
  }

  /**
   * Handles unlock event.
   */
  onUnlocked() {
    this.locked = false;
  }
}
