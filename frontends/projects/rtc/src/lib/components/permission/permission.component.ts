import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PermissionDescription } from '@sstepkiz';

@Component({
  selector: 'lib-rtc-permission',
  styleUrls: ['./permission.component.scss'],
  templateUrl: './permission.component.html'
})
export class PermissionComponent {

  /**
   * Emits delete button click.
   */
  @Output()
  remove: EventEmitter<PermissionDescription> = new EventEmitter();

  /**
   * Emits modify button click.
   */
  @Output()
  update: EventEmitter<PermissionDescription> = new EventEmitter();

  /**
   * Description of the permission.
   */
  @Input()
  permission: PermissionDescription;

  /**
   * Triggers the remove event.
   */
  removePermission(): void {
    this.remove.emit(this.permission);
  }

  /**
   * Triggers the update event.
   */
  updatePermission(): void {
    this.update.emit(this.permission);
  }
}
