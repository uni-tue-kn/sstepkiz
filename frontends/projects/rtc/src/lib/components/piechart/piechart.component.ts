import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'lib-piechart',
  templateUrl: './piechart.component.html',
  styleUrls: ['./piechart.component.css']
})
export class PiechartComponent implements OnInit {
  @Input() vlf: number = 1500;
  @Input() lf : number = 4000;
  @Input() hf : number = 3500;
  @Input() themeType : string;
  @Input() proportional : boolean;
  @Input() animations : boolean;
  @Input() colorPaletteFlag : boolean;

//dynamically update chart
ngOnChanges(changes: SimpleChanges) {
  var newOptions = this.options;
  if(changes.vlf!==undefined && changes.lf!==undefined && changes.hf!==undefined) {
    //round to 4 decimal places
    var newVlf: number =Math.round(changes.vlf.currentValue*10000)/10000;
    var newLf : number =Math.round(changes.lf.currentValue*10000)/10000;
    var newHf : number =Math.round(changes.hf.currentValue*10000)/10000;
    if(newVlf===0||newLf===0||newHf===0){
      newVlf=0.25;
      newLf=0.4;
      newHf=0.35;
    }
    newOptions.series[0].data= [
      { value: newVlf, name: 'VLF' },
      { value: newLf, name: 'LF' },
      { value: newHf, name: 'HF' },
    ];
    if(this.chartInstance) {
      this.chartInstance.setOption(newOptions);
    }
  }
  if(changes.themeType!==undefined) {
    this.themeType = changes.themeType.currentValue;
    //change color here
    newOptions=this.colorByTheme(newOptions);
    if(this.chartInstance) {
      this.chartInstance.setOption(newOptions);
    }
  }
  if(changes.colorPaletteFlag!==undefined) {
    this.colorPaletteFlag=changes.colorPaletteFlag.currentValue;
    if(this.colorPaletteFlag) {
      newOptions.visualMap=undefined;
      newOptions.series[0].itemStyle.normal.color=undefined;
    }
    else {
      newOptions = this.colorByTheme(newOptions);
    }
    if(this.chartInstance) {
      this.chartInstance.setOption(newOptions);
    }
  }
  if(changes.animations!==undefined) {
    newOptions.series[0].animation=changes.animations.currentValue;
  }
  if(changes.proportional!==undefined) {
    this.proportional = changes.proportional.currentValue;
    if(this.proportional) {
      newOptions.series[0].roseType='radius';
    }
    else {
      newOptions.series[0].roseType='';
    }
  }
}

private colorByTheme(newOptions) {
  if(this.themeType==='dark') {
    newOptions.backgroundColor= '#424242';
    if(!this.colorPaletteFlag) {
      newOptions.series[0].itemStyle.normal.color='#69F0AE';
    }
    newOptions.series[0].label.normal.textStyle.color = 'rgba(255, 255, 255, 1)';
    newOptions.series[0].labelLine.normal.lineStyle.color = 'rgba(255, 255, 255, 1)';
  }
  else if (this.themeType==='light'){
    newOptions.backgroundColor= '#E0E0E0';
    if(!this.colorPaletteFlag) {
      newOptions.series[0].itemStyle.normal.color='#455A64';
    }
    newOptions.series[0].label.normal.textStyle.color = 'rgba(0, 0, 0, 1)';
    newOptions.series[0].labelLine.normal.lineStyle.color = 'rgba(0, 0, 0, 1)';
  }
  return newOptions;
}

  constructor() {
    this.colorPaletteFlag = false;
  }

  ngOnInit(): void {}

  private colorPalette = ['#F44336','#FFEB3B','#4CAF50'];
  chartInstance: any;
  options = {
    // backgroundColor: '#424242',
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)',
    },
    visualMap: undefined,/*{
      show: false,
      min: 0.1,
      max: 0.9,
      inRange: {
        colorLightness: [0.2, 0.9],
      },
    },*/
    series: [
      {
        name: 'Spectogram',
        type: 'pie',
        radius: '90%',
        center: ['50%', '50%'],
        color: this.colorPalette,
        data: [
          { value: this.vlf, name: 'VLF' },
          { value: this.lf, name: 'LF' },
          { value: this.hf, name: 'HF' },
        ],
        roseType: 'radius',
        label: {
          normal: {
            textStyle: {
              color: 'rgba(0, 0, 0, 1)',
            },
          },
        },
        labelLine: {
          normal: {
            lineStyle: {
              color: 'rgba(0, 0, 0, 1)',
            },
            smooth: 0.2,
            length: 10,
            length2: 20,
          },
        },
        itemStyle: {
          normal: {
            color: '#69F0AE',
            shadowBlur: 20,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        animation: true,
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: () => Math.random() * 200,
      }
    ],
  };


  onChartInit(e: any) {
    this.chartInstance = e;
    //console.log('on chart init:', e);
  }
}
