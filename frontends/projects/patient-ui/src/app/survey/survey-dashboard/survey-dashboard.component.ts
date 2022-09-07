import { Component, OnDestroy } from "@angular/core";
import { LocationStrategy } from "@angular/common";
import { AuthService } from "projects/auth/src/public-api";
import { ImeraApiService } from "projects/imera-api/src/public-api";
import { ContextSchedule } from "@sstepkiz";
import { Subscription } from "rxjs";
import dayjs from "dayjs";
import { HotToastService } from "@ngneat/hot-toast";

const MAX_NUMBER_OF_UPCOMING_CONTEXT_SCHEDULES = 5;

@Component({
  selector: "app-context-dashboard",
  templateUrl: "./survey-dashboard.component.html",
  styleUrls: ["./survey-dashboard.component.scss"],
})
export class SurveyDashboardComponent implements OnDestroy {
  contextSchedules: ContextSchedule[];
  toDay: Date = new Date();
  tomorrow: Date = new Date();
  toMilliseconds = 1000;
  currentContextSchedules: ContextSchedule[] = [];
  upComingContextSchedules: ContextSchedule[] = [];
  disable = true;
  refreshInterval: number;
  subscriptions: Subscription[] = [];
  intervalId: number;

  constructor(
    private imeraApiService: ImeraApiService,
    public readonly authService: AuthService,
    private toast: HotToastService
  ) {
    this.toDay.setHours(0, 0, 0);
    this.tomorrow.setDate(this.toDay.getDate() + 1);
    /**
     * If the user is not yet authenticated, he will be asked until he is.
     */
    if (!this.authService.isAuthenticated) {
      this.intervalId = setInterval(() => {
        this.auth();
      }, 1000);
    } else {
      this.loadContext();
    }
  }

  /**
   * If the user is authenticated, the content is loaded and the interval is deleted, otherwise asked further.
   */
  auth() {
    if (this.authService.isAuthenticated) {
      this.loadContext();
      clearInterval(this.intervalId);
    } else {
      console.log("not authenticated");
      this.toast.error("Nicht authentifiziert! Bitte logge dich neu ein!");
    }
  }

  /**
   *
   */
  loadContext() {
    this.imeraApiService
      .getUserContextSchedules()
      .then((data) => {
        this.contextSchedules = data.map(function (context) {
          context.beginTimestamp = new Date(context.beginTimestamp);
          return context;
        });

        this.contextSchedules.sort(
          (a, b) =>
            new Date(a.beginTimestamp).getTime() -
            new Date(b.beginTimestamp).getTime()
        );
        this.sortContextSchedules();
        this.refreshInterval = setInterval(() => {
          this.sortContextSchedules();
        }, 60000);
      })
      .catch((err) => {
        console.error(err);
        this.toast.error("Das hat leider nicht funktioniert! Tut uns leid!");
      });
  }

  timeNow() {
    const time = new Date();
    return time;
  }

  sortContextSchedules() {
    this.currentContextSchedules = [];
    this.upComingContextSchedules = [];
    let deprecatedContextSchedules: ContextSchedule[] = [];
    let contextScheduleEndTime: Date;
    let endsInPast: boolean = false;

    this.contextSchedules.forEach((contextSchedule) => {
      contextScheduleEndTime = new Date(contextSchedule.beginTimestamp);
      contextScheduleEndTime.setSeconds(
        contextScheduleEndTime.getSeconds() + contextSchedule.duration
      );
      endsInPast = this.timeNow() > contextScheduleEndTime;

      // check if start of contextSchedule has begun
      if (
        contextSchedule.beginTimestamp < this.tomorrow &&
        contextSchedule.beginTimestamp <= this.timeNow()
      ) {
        if (
          !contextSchedule.mandatory ||
          (contextSchedule.mandatory && !endsInPast)
        ) {
          this.currentContextSchedules.push(contextSchedule);
        } else if (contextSchedule.mandatory) {
          //delete mandatory deprecated context schedule
          console.log("deleting mandatory context schedule");
          this.imeraApiService
            .deleteContextSchedule(contextSchedule.id)
            .toPromise();
        }
      } else {
        if (
          this.upComingContextSchedules.length <
          MAX_NUMBER_OF_UPCOMING_CONTEXT_SCHEDULES
        ) {
          this.upComingContextSchedules.push(contextSchedule);
        }
      }
    });

    //find and delete deprecated context schedules
    this.findDeprecatedContextSchedules(deprecatedContextSchedules);
    deprecatedContextSchedules.forEach((schedule) => {
      console.log("deprecated context schedule: ", schedule);
      this.imeraApiService.deleteContextSchedule(schedule.id).toPromise();
    });

    //check if context has observation, otherwise dont show them
    this.currentContextSchedules.forEach((contextSchedule) => {
      this.subscriptions.push(
        this.imeraApiService
          .getObservationsByContextId(String(contextSchedule.context.id))
          .subscribe((data) => {
            this.subscriptions.push(
              this.imeraApiService
                .extendObservations(data)
                .subscribe((data) => {
                  if (data?.length == 0) {
                    this.currentContextSchedules.splice(
                      this.currentContextSchedules.indexOf(contextSchedule),
                      1
                    );
                  }
                })
            );
          })
      );
    });
  }

  findDeprecatedContextSchedules(
    deprecatedContextSchedules: ContextSchedule[]
  ) {
    for (let contextSchedule of this.currentContextSchedules) {
      let contextSchedules = this.currentContextSchedules.filter(
        (schedule) => schedule.context.id == contextSchedule.context.id
      );
      //find most recent
      if (contextSchedules.length > 0) {
        let now = dayjs();
        let minTime: number = now.diff(
          dayjs(contextSchedules[0].beginTimestamp)
        );
        let mostRecentSchedule = contextSchedules[0];
        contextSchedules.forEach((schedule) => {
          var time = now.diff(dayjs(schedule.beginTimestamp));
          if (time < minTime) {
            mostRecentSchedule = schedule;
            minTime = time;
          }
        });
        contextSchedules.splice(
          contextSchedules.indexOf(mostRecentSchedule),
          1
        );
      }
      deprecatedContextSchedules.push(...contextSchedules);
      deprecatedContextSchedules.forEach((depSchedule) => {
        this.currentContextSchedules.splice(
          this.currentContextSchedules.indexOf(depSchedule),
          1
        );
      });
    }
  }

  ngOnDestroy() {
    clearInterval(this.refreshInterval);
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
