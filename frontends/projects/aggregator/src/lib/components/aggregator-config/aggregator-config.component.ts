import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AggregatorConfig } from '@sstepkiz';

@Component({
  selector: 'lib-aggregator-config',
  templateUrl: './aggregator-config.component.html'
})
export class AggregatorConfigComponent {

  config: AggregatorConfig;
  @Input()
  set configuration(config: AggregatorConfig) {
    this.config = config;
  }

  @Output()
  configChange = new EventEmitter<AggregatorConfig>();

  @Output()
  delete = new EventEmitter<void>();

  newTime = '';

  applyChanges(): void {
    this.configChange.emit(this.config);
  }

  addTime(): void {
    this.config.uploadTimes.push(this.newTime);
    this.newTime = '';
  }

  removeTime(index: number): void {
    this.config.uploadTimes.splice(index, 1);
  }
}
