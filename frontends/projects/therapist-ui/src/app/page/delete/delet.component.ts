import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-delet",
  styleUrls: ["./delet.component.scss"],
  templateUrl: "./delet.component.html",
})
export class DeleteDialogComponent {
  constructor(public dialogRef: MatDialogRef<DeleteDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: { contextId: string }) {}

  delete() {
    this.dialogRef.close({ event: "close", sucessfull: true });
  }

  onNoClick(): void {
    this.dialogRef.close({ event: "close", sucessfull: false });
  }
}
