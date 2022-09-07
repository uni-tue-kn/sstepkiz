import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import * as moment from "moment";

/**
 * Time that has been picked by the therapist per day
 */
interface TimePick {
  start: string;
  end: string;
}

/**
 * data set
 *
 */
class DataSet {
  dateRange: moment.Moment[];
  isMandatory: boolean;
  repeatDays: any[];
  timePicks: TimePick[];
}

@Component({
  selector: 'app-weekly-context-schedule',
  templateUrl: './weekly-context-schedule.component.html',
  styleUrls: ['./weekly-context-schedule.component.scss']
})
export class WeeklyContextScheduleComponent implements OnInit {

  /**
   * Form
   */
  @Input() dataSet: DataSet;
  @Output() dataChange  = new EventEmitter<DataSet>();

  minDate: Date;

  constructor() {
    dayjs.extend(customParseFormat);
    this.minDate = new Date();
  }

  ngOnInit(): void {
  }

  onDataChange()  {
    this.dataChange.emit(this.dataSet);
  }
}
