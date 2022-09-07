import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent {

  error: string;

  constructor(public dialogRef: MatDialogRef<ErrorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { error }) { 
      if(data.error.status == 401){
        this.error = "Sie sind nicht angemeldet"
      } else{
        this.error = data.error.error
      }


    }


  onNoClick(): void {
    this.dialogRef.close();
  }
}