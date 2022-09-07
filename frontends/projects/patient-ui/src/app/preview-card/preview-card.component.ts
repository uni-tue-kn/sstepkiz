import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-preview-card',
  templateUrl: './preview-card.component.html',
  styleUrls: ['./preview-card.component.scss']
})
export class PreviewCardComponent implements OnInit {

  @Input() title: string;
  @Input() image: string;
  @Input() text: string;
  @Input() link: string;
  @Input() button: string;
  constructor() { }

  ngOnInit(): void {
  }

}
