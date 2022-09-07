import { ThisReceiver } from "@angular/compiler";
import { Component, OnInit } from "@angular/core";
import { Result } from "@sstepkiz";
import { ImeraApiService } from "projects/imera-api/src/public-api";
import { UserInformationService } from "../services/user-information.service";

@Component({
  selector: "app-statistic",
  templateUrl: "./statistic.component.html",
  styleUrls: ["./statistic.component.scss"],
})
export class StatisticComponent implements OnInit {
  constructor(
    private imeraService: ImeraApiService,
    private userService: UserInformationService
  ) {}

  resultsNumber: number;

  days: { title: String; in: boolean; value: number }[] = [
    { title: "So", in: false, value: 0 },
    { title: "Mo", in: false, value: 1 },
    { title: "Di", in: false, value: 2 },
    { title: "Mi", in: false, value: 3 },
    { title: "Do", in: false, value: 4 },
    { title: "Fr", in: false, value: 5 },
    { title: "Sa", in: false, value: 6 },
  ];

  ngOnInit(): void {
    if (this.userService.results) {
      this.setDays(this.userService.results);
      this.resultsNumber = this.userService.results.length;
    } else {
      this.imeraService.getFilteredResult().then((results) => {
        if (results) {
          this.userService.setResults(results);
          this.setDays(results);
          this.resultsNumber = results.length;
        }
      });
    }
  }

  /**
   * Sets the values in days[] to true on which a context was answered this week
   * @param results
   */
  setDays(results: Result[]) {
    const toDay: Date = new Date();
    const day: number = toDay.getDay();
    let weekBegin: Date = new Date();

    weekBegin.setDate(toDay.getDate() - day);
    let weekBeginTime = weekBegin.setHours(0, 0, 0, 0);

    let resultThisWeek = results.filter(
      (result) =>
        !(new Date(result.created).setHours(0, 0, 0, 0) < weekBeginTime)
    );

    resultThisWeek.forEach(
      (result) => (this.days[new Date(result.created).getDay()].in = true)
    );
  }
}
