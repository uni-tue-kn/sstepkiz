import { Component} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-new-etape',
  styleUrls: ['./new-etape.component.scss'],
  templateUrl: './new-etape.component.html',
})
export class NewEtapeComponent {

  constructor(
    public dialogRef: MatDialogRef<NewEtapeComponent>,
  ) { }

  close(){
    this.dialogRef.close({ event: 'close' });
  }
}
