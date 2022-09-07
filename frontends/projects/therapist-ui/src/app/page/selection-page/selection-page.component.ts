import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-selection-page',
  templateUrl: './selection-page.component.html',
  styleUrls: ['./selection-page.component.scss']
})
export class SelectionPageComponent implements OnInit {
@Input() navElements: any[];

  constructor() { }

  ngOnInit(): void {

  }

}
