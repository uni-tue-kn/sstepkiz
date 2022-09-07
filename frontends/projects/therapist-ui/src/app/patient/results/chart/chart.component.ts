import { Component, Input } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color} from 'ng2-charts';
@Component({
  selector: 'app-chart',
  styleUrls: ['./chart.component.scss'],
  templateUrl: './chart.component.html',
})
export class ChartComponent {

  @Input() labels: String[];

  lineChartData: ChartDataSets[]
  @Input()
  set charData(result: { name: string, data: number[] }) {
    this.lineChartData = [
        {
          data: result.data,
          label: result.name,
          pointRadius: 10,
        }
    ]
  }

  // Define chart options
  lineChartOptions: ChartOptions = {
    responsive: true,

    spanGaps: true,
    scales: {
      yAxes: [{
        ticks:
          { beginAtZero: true, }
      }]
    }
  };

  // Define colors of chart segments
  lineChartColors: Color[] = [
    {
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
    }
  ];

  // Set true to show legends
  lineChartLegend = true;

  // Define type of chart
  lineChartType = 'line';

  lineChartPlugins = [];
}
