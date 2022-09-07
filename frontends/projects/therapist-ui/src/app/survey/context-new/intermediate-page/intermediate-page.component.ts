import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ImportComponent } from '../../import/import.component';

@Component({
  selector: 'app-intermediate-page',
  templateUrl: './intermediate-page.component.html',
  styleUrls: ['./intermediate-page.component.scss']
})
export class IntermediatePageComponent implements OnInit {

  constructor(public dialog: MatDialog) { }
  routerLinkBack = '/studie/befragungen';
  routerLinkContinue = '/studie/befragung';

  ngOnInit(): void {
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ImportComponent, {
      width: '500px'
    });
    dialogRef.componentInstance.update = false;
    dialogRef.afterClosed();
  }


}
