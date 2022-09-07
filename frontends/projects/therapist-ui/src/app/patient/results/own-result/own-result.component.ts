import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-own-result',
  templateUrl: './own-result.component.html',
  styleUrls: ['./own-result.component.scss']
})
export class OwnResultComponent implements OnInit {

  @Input() data: { name: string, value?: number }[];
  @Input() lable: { x: string, y: string };
  @Input() name: string;


  canvasContext;

  /**
    * Reference to canvas element.
    */
  @ViewChild('canvas')
  canvas: ElementRef;

  /**
   * Gets the HTML element of the canvas.
   */
  get canvasElement(): HTMLCanvasElement {
    return this.canvas?.nativeElement;
  }

  
  sections: number;
  chartHeight: number = 100;
  chartWidth: number = 200;
  yLableHeight: number = 20;
  xLableHeight: number = 40;
  yMax: number = 10;
  stepSize: number;
  columnSize: number = 10;
  rowSize: number;
  margin: number = 5;
  canvasHeight: number = this.chartHeight + this.margin*2 + this.xLableHeight;
  canvasWidth: number = this.chartWidth + this.margin*2 + this.yLableHeight;


  constructor() { }

  ngAfterViewInit(): void {

    this.rowSize = this.chartWidth / this.data.length;

    this.canvasContext = this.canvasElement.getContext('2d');
    this.canvasContext.fillStyle='rgba(0,0,0,.54)';

    
  }

  ngOnInit(): void {




  }

}
