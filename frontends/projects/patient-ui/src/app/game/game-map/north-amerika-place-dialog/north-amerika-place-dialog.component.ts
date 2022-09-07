import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-north-amerika-place-dialog',
  templateUrl: './north-amerika-place-dialog.component.html',
  styleUrls: ['./north-amerika-place-dialog.component.scss']
})
export class NorthAmerikaPlaceDialogComponent implements OnInit {

  path = "../../../assets/game/";
  imagePath: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.imagePath = data.imagePath;
    console.log("image path: ", this.imagePath);
  }

  ngOnInit(): void {

  }

}
