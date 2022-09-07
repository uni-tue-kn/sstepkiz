import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-yes-no-dialog',
  templateUrl: './yes-no-dialog.component.html',
})
export class YesNoDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: {
      body: string,
      title: string
    }
  ) {}
}
