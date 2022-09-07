import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
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
  selector: 'app-free-context-schedule',
  templateUrl: './free-context-schedule.component.html',
  styleUrls: ['./free-context-schedule.component.scss']
})
export class FreeContextScheduleComponent implements OnInit {

  DISPLAY_DAYS: {
    title: string;
    in: boolean;
    value: number;
    disabled?: boolean;
  }[] = [
    { title: "Mo", in: false, value: 1, disabled: true },
    { title: "Di", in: false, value: 2, disabled: true },
    { title: "Mi", in: false, value: 3, disabled: true },
    { title: "Do", in: false, value: 4, disabled: true },
    { title: "Fr", in: false, value: 5, disabled: true },
    { title: "Sa", in: false, value: 6, disabled: true },
    { title: "So", in: false, value: 0, disabled: true },
  ];

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

  addTime() {
    this.dataSet.timePicks.push({start: "00:00", end: "00:00"});
  }

  removeTime(index: number) {
    this.dataSet.timePicks.splice(index, 1);
  }

  toggleDays(element) {
    const index = this.dataSet.repeatDays.findIndex(
        ({ title }) => title == element.title
    );
    if (index == -1) {
      this.dataSet.repeatDays.push(element);
    } else {
      this.dataSet.repeatDays.splice(index, 1);
    }
  }

  onDataSetChange() {
    this.dataChange.emit(this.dataSet);
  }

  onRangeChanged() {
    console.log("on range changed");
    if (!(this.dataSet.dateRange[0] && this.dataSet.dateRange[1])) {
      return;
    }
    let start = dayjs(this.dataSet.dateRange[0].toDate());
    let end = dayjs(this.dataSet.dateRange[1].toDate());
    console.log("start: ", start);

    this.updateDisplayDaysArray(start.day());
    for (let i = 0; i < 6; i++) {
      start = start.add(1, "days");
      this.updateDisplayDaysArray(start.day());
      if (end.diff(start, "day") < 1) {
        return;
      }
    }

    console.log("days: ", this.DISPLAY_DAYS);
  }

  private updateDisplayDaysArray(dayOfWeek: number) {
    console.log("dayOfWeek: ", dayOfWeek);
    if (dayOfWeek == 0) {
      this.DISPLAY_DAYS[6].disabled = false;
    } else {
      this.DISPLAY_DAYS[dayOfWeek - 1].disabled = false;
    }
  }

}
