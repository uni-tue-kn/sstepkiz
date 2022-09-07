import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-com-message-dialog',
  templateUrl: './com-message-dialog.component.html'
})
export class ComMessageDialogComponent {

  /**
   * Message displayed in the dialog.
   */
  readonly message: string;

  /**
   * Constructs a dialog to display a message from COM Channel.
   * @param data Data from material dialog.
   * @param dialogRef Reference to material dialog.
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) data,
    private dialogRef: MatDialogRef<ComMessageDialogComponent>
  ) {
    this.message = data.message;
  }

  /**
   * Closes the message dialog.
   */
  close() {
    this.dialogRef.close();
  }
}
