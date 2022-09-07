import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-yes-no-dialog',
  styleUrls: ['./yes-no-dialog.component.scss'],
  templateUrl: './yes-no-dialog.component.html',
})
export class YesNoDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public readonly data: {
      title: string,
      description?: string,
    },
  ) { }
}
