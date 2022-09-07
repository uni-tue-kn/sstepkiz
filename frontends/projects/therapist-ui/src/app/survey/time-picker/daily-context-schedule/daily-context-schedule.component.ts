import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import * as moment from 'moment';

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

interface DailyDataSet {
  dateRange: moment.Moment[];
  isMandatory: boolean;
  timePick: TimePick;
}

@Component({
  selector: 'app-daily-context-schedule',
  templateUrl: './daily-context-schedule.component.html',
  styleUrls: ['./daily-context-schedule.component.scss']
})
export class DailyContextScheduleComponent implements OnInit {

  /**
   * Form
   */
  @Input() dataSet: DataSet;
  @Output() dataChange  = new EventEmitter<DataSet>();

  minDate: Date;

  constructor(public fb: FormBuilder) {
    dayjs.extend(customParseFormat);
    this.minDate = new Date();

  }

  /**
   * Lifecycle
   */
  ngOnInit(): void {
  }

  onDataChange()  {
    this.dataChange.emit(this.dataSet);
  }

}
