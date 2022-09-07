import {AfterViewInit, Component, OnInit, ViewChild} from "@angular/core";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators,} from "@angular/forms";
import {Context, ContextSchedule, User} from "@sstepkiz";
import {ImeraApiService} from "projects/imera-api/src/public-api";
import {StateService} from "../../Services/state.service";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/de";
import {HotToastService} from "@ngneat/hot-toast";
import {MatTableDataSource} from "@angular/material/table";
import {SelectionModel} from "@angular/cdk/collections";
import {MatSort} from "@angular/material/sort";
import {MatPaginator} from "@angular/material/paginator";
import {Router} from "@angular/router";
import * as moment from 'moment';

/**
 * Time that has been picked by the therapist per day
 */
interface TimePick {
  start: string;
  end: string;
}

class ImeraTime {
  startHours: string;
  startMinutes: string;
  duration: number;
}

class DataSet {
  dateRange: moment.Moment[];
  isMandatory: boolean;
  repeatDays: any[];
  timePicks: TimePick[];
}

@Component({
  selector: "app-time-picker",
  templateUrl: "./time-picker.component.html",
  styleUrls: ["./time-picker.component.scss"],
})

/**
 * Create the schedules for Contexts
 **/
export class TimePickerComponent implements OnInit, AfterViewInit {
  /**
   * Navigation paths
   */
  routerLinkBack = "studie/befragung";

  isLoading = true;

  /**
   * Current Tab Id:
   * 0: Pick user
   * 1: Create timestamps
   */
  currentTabId: number = 0;
  currentPreset: string = "daily";

  /**
   * data source for the user table
   */
  userDataSource = new MatTableDataSource<User>();
  displayedColumns: string[] = ['select', 'id', 'name'];
  @ViewChild(MatPaginator, {static: false}) userPaginator: MatPaginator;
  @ViewChild(MatSort) userSort: MatSort;
  userSelection = new SelectionModel<User>(true, []);

  contextSchedules: ContextSchedule[] = [];

  minDate: Date;

  allUsers: User[];
  @ViewChild("userList")
  userList;

  repetitionTime = new FormArray([
    new FormGroup({
      start: new FormControl(null, Validators.required),
      end: new FormControl(null, Validators.required),
    }),
  ]);
  range = new FormGroup({
    start: new FormControl(null, Validators.required),
    end: new FormControl(null, Validators.required),
  });
  minTime = "02:00";
  loading = false;
  worked = true;
  errorLog: {
    errorCode: number;
    user: User;
    contextSchedule: Date;
    error: string;
  }[] = [];

  dataSet: DataSet = { dateRange: [], timePicks: [{start: "00:00", end: "00:00"}], isMandatory: false, repeatDays: [] };


  constructor(private router: Router,
    public fb: FormBuilder,
    private stateService: StateService,
    private imeraApiService: ImeraApiService,
    private toast: HotToastService
  ) {
    this.allUsers = this.imeraApiService.getUsers();

    dayjs.extend(customParseFormat);
    this.minDate = new Date();
  }

  /**
   * Lifecycle
   */
  ngOnInit() {
    //fetch all users
    this.imeraApiService.loadAllUsers().subscribe((users) => {
      this.userDataSource.data = users;
      this.isLoading = false;
    })
  }

  ngAfterViewInit() {
    this.userDataSource.sort = this.userSort;
    this.userDataSource.paginator = this.userPaginator;
  }

  navigateBack()  {
    this.router.navigate([this.routerLinkBack]);
  }

  /**
   * tabs
   */
  changeCurrentTab(id: number)  {
    this.currentTabId = id;
  }

  async onSubmit()  {
    this.isLoading = true;
    this.errorLog = [];
    this.contextSchedules = [];

    if (this.userSelection.selected.length > 0) {
      await this.createContextSchedules();
    }
    this.isLoading = false;
  }

  async createContextSchedules() {
    switch (this.currentPreset) {
      case "daily":
        this.createNewDailyContextSchedules();
        break;

      case "weekly":
        this.createNewWeeklyContextSchedules();
        break;

      case "advanced":
        this.createNewAdvancedContextSchedules();
        break;
    }
    await this.sendNewContextSchedules();
  }

  createNewDailyContextSchedules()  {
    const contextId = this.stateService.currentContextId;
    const start: Date = this.dataSet.dateRange[0].toDate();
    const end: Date = this.dataSet.dateRange[1].toDate();
    const beginTimestamps = this.calcBeginTimestamps(
        start,
        end,
        false,
        []
    );
    const repetitionTimes = this.createImeraTimestampForSingleTimePick(this.dataSet.timePicks[0]);

    console.log("repetitionTimes", repetitionTimes);

    this.userSelection.selected.forEach((user) => {
      beginTimestamps.forEach((timestamp) => {
        repetitionTimes.forEach((imereTimeStamp) => {
          timestamp.setHours(Number(imereTimeStamp.startHours), Number(imereTimeStamp.startMinutes));
          const contextSchedule = new ContextSchedule(
              user,
              new Context({ id: Number(contextId) }),
              new Date(timestamp.getTime()),
              imereTimeStamp.duration,
              this.dataSet.isMandatory
          );
          this.contextSchedules.push(contextSchedule);
        })
      })
    });
  }

  createNewWeeklyContextSchedules()  {
    const contextId = this.stateService.currentContextId;
    const start: Date = this.dataSet.dateRange[0].toDate();
    const end: Date = this.dataSet.dateRange[1].toDate();
    const beginTimestamps = this.calcBeginTimestamps(
        start,
        end,
        true,
        []
    );
    console.log("begin timestamps: ", beginTimestamps);
    const repetitionTimes = this.createImeraTimestampForSingleTimePick(this.dataSet.timePicks[0]);
    console.log("repit times:", repetitionTimes);

    this.userSelection.selected.forEach((user) => {
      beginTimestamps.forEach((timestamp) => {
        repetitionTimes.forEach((imereTimeStamp) => {
          timestamp.setHours(Number(imereTimeStamp.startHours), Number(imereTimeStamp.startMinutes));
          const contextSchedule = new ContextSchedule(
              user,
              new Context({ id: Number(contextId) }),
              new Date(timestamp.getTime()),
              imereTimeStamp.duration,
              false
          );
          this.contextSchedules.push(contextSchedule);
        })
      })
    });
  }

  createNewAdvancedContextSchedules()  {
    const contextId = this.stateService.currentContextId;
    const start: Date = this.dataSet.dateRange[0].toDate();
    const end: Date = this.dataSet.dateRange[1].toDate();
    const beginTimestamps = this.calcBeginTimestamps(
        start,
        end,
        false,
        this.dataSet.repeatDays
    );
    console.log("begin timestamps: ", beginTimestamps);
    const repetitionTimes = this.createImeraTimestampForTimePicks(this.dataSet.timePicks);
    console.log("repit times:", repetitionTimes);

    this.userSelection.selected.forEach((user) => {
      beginTimestamps.forEach((timestamp) => {
        repetitionTimes.forEach((imereTimeStamp) => {
          timestamp.setHours(Number(imereTimeStamp.startHours), Number(imereTimeStamp.startMinutes));
          const contextSchedule = new ContextSchedule(
              user,
              new Context({ id: Number(contextId) }),
              new Date(timestamp.getTime()),
              imereTimeStamp.duration,
              this.dataSet.isMandatory
          );
          this.contextSchedules.push(contextSchedule);
        })
      })
    });
  }

  createImeraTimestampForSingleTimePick(timePick: TimePick): ImeraTime[]  {
    const repetitionTimes = [];

    if (timePick.end === "00:00") {
      const placeholderDate = new Date("October 13, 2014 ");
      placeholderDate.setHours(Number(timePick.start.substring(0, 2)), Number(timePick.start.substring(3, 5)));
      const startDayJs = dayjs(placeholderDate);
      const endDate = startDayJs.add(1, "m");
      timePick.end = endDate.format('HH:mm');
    }
    repetitionTimes.push(
        this.calcDuration(
            timePick.start,
            timePick.end
        )
    );

    return repetitionTimes;
  }

  createImeraTimestampForTimePicks(timePicks: TimePick[]): ImeraTime[]  {
    const repetitionTimes = [];

    timePicks.forEach((timePick) => {
      repetitionTimes.push(
          this.calcDuration(
              timePick.start,
              timePick.end
          )
      );
    });

    return repetitionTimes;
  }

  isValid(): boolean {
    if (this.userSelection.selected.length != 0) {
      switch (this.currentPreset) {
        case "daily":
          if (this.dataSet.dateRange[0] && this.dataSet.dateRange[1]) {
            if (this.dataSet.isMandatory) {
              if (this.dataSet.timePicks[0].end === "00:00") {
                return false;
              }
            }
            return true;
          }
          break;

        case "weekly":
          if (this.dataSet.dateRange[0] && this.dataSet.dateRange[1]) {
            return true;
          }
          break;

        case "advanced":
          if (this.dataSet.dateRange[0] && this.dataSet.dateRange[1]) {
            return this.dataSet.timePicks[0].end !== "00:00";
          }
          break;

        default:
          return false;
      }
    }
    return false;
  }

  onToggleSchedulePreset(event)  {
    console.log("preset toggled: ", event);
    this.currentPreset = event.value;
  }

  /*createNewContextSchedules(): void {
    if (!this.timeSheetForm.get("patients").value) {
      this.userList.selectedOptions.selected.forEach((element) => {
        this.createAllSchedulesForOneUser(element.value);
      });
    } else {
      this.allUsers.forEach((user) => {
        this.createAllSchedulesForOneUser(user);
      });
    }
  }*/

  /*createAllSchedulesForOneUser(user: User) {
    const contextId = this.stateService.currentContextId;
    const start: Date = new Date(this.timeSheetForm.get("range.start").value);
    const end: Date = new Date(this.timeSheetForm.get("range.end").value);
    const beginTimestamps = this.calcBeginTimestamps(
      start,
      end,
          this.repeatDays
    );
    const repetitionTimes = this.createRepetitionArray();

    beginTimestamps.forEach((timestamp) => {
      repetitionTimes.forEach((time) => {
        timestamp.setHours(Number(time.startHours), Number(time.startMinutes));
        const contextSchedule = new ContextSchedule(
          user,
          new Context({ id: Number(contextId) }),
          new Date(timestamp.getTime()),
          time.duration,
          this.timeSheetForm.get("mandatory").value
        );
        this.contextSchedules.push(contextSchedule);
      });
    });
  }*/

  calcBeginTimestamps(start: Date, end: Date, isWeekly: boolean, days: any[]): Date[] {
    let nextDate = new Date(start);
    const beginTimestamps = [];
    const oneDay = 1;
    const oneWeek = 7;

    if (isWeekly) {
      days.push({ value: start.getDay() });
    }

    if (days.length == 0 || days.length == 6) {
      beginTimestamps.push(start);

      while (nextDate < end) {
        nextDate = new Date(nextDate);
        nextDate.setDate(nextDate.getDate() + oneDay);
        beginTimestamps.push(nextDate);
      }
    } else {
      let runnerDate = dayjs(start);
      const endDate = dayjs(end);

      while (runnerDate <= endDate) {
        for (const day of days) {
          if (runnerDate.day() === day.value)  {
            beginTimestamps.push(runnerDate.toDate());
            break;
          }
        }
        runnerDate = runnerDate.add(1, 'd');
      }
    }
    return beginTimestamps;
  }

  calcDuration(start: string, end: string): ImeraTime {
    const time = {
      startHours: null,
      startMinutes: null,
      duration: 0,
    };

    const placeholderDate = "October 13, 2014 ";
    const startTime = new Date(placeholderDate + start);
    const endTime = new Date(placeholderDate + end);
    const toSeconds = 1000;
    const duration = endTime.getTime() - startTime.getTime();
    time.duration = duration / toSeconds;
    console.log("test", start, time);
    const splitTime = start.split(":");
    time.startHours = splitTime[0];
    time.startMinutes = splitTime[1];

    return time;
  }

  async sendNewContextSchedules() {
    for (const contextSchedule of this.contextSchedules) {
      await this.imeraApiService
        .createContextSchedule(contextSchedule)
        .toPromise()
        .then((res) => {})
        .catch((err) => {
          this.worked = false;
          this.errorLog.push({
            errorCode: err.status,
            user: contextSchedule.user,
            contextSchedule: contextSchedule.beginTimestamp,
            error: err.error,
          });
        });
    }
    return;
  }

  onDataSetChange(event) {
    console.log("event: ", event);
    this.dataSet = event;
    //this.dataSet = event;
  }

  /**
   *  user table selection
   */
  isAllSelected() {
    const numSelected = this.userSelection.selected.length;
    const numRows = this.userDataSource.data.length;
    return numSelected === numRows;
  }

  selectAllToggle() {
    if (this.isAllSelected()) {
      this.userSelection.clear();
      return;
    }
    this.userSelection.select(...this.userDataSource.data);
  }

  checkboxLabel(row?: User): string {
    if (!row) {
      return `${this.isAllSelected() ? "deselect" : "select"} all`;
    }
    return `${this.userSelection.isSelected(row) ? "deselect" : "select"} row ${row.id}`;
  }
}
