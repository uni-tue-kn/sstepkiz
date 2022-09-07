import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import { ImeraApiService } from "projects/imera-api/src/public-api";
import { ContextSchedule } from "@sstepkiz";
import { Subscription } from "rxjs";

@Component({
  selector: "app-context-preview",
  styleUrls: ["./survey-preview.component.scss"],
  templateUrl: "./survey-preview.component.html",
})
export class SurveyPreviewComponent implements OnInit {
  @Input() context: ContextSchedule;
  @Input() disable: boolean;
  subscriptions: Subscription[] = [];
  endTimestamp: Date;
  coins: string;
  imageNum: number = 21;
  src: string;

  constructor(
    private router: Router,
    private imeraApiService: ImeraApiService
  ) {}

  /**
   * Preview Cards show random item object available in maps
   * @returns
   */
  getImage(): string {
    return (
      "../../../assets/game/preview/" +
      (Math.round(Math.random() * this.imageNum) + 1) +
      ".png"
    );
  }

  ngOnInit(): void {
    //load observations to compute survey coin reward
    this.subscriptions.push(
      this.imeraApiService
        .getObservationsByContextId(String(this.context.context.id))
        .subscribe(
          (observations) => {
            if (observations !== null && observations !== undefined) {
              //determine coin value
              //this.coins = String(observations.length);
              this.coins = "50";
            }
          },
          (error) => {
            console.log(
              "error while loading observations for preview: ",
              error
            );
          }
        )
    );

    this.src = this.getImage();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  timeNow() {
    const time = new Date();
    return time;
  }

  start() {
    if (!this.disable) {
      this.router.navigate(["/surveypage", this.context.id], {
        replaceUrl: true,
        skipLocationChange: true,
      });
    }
  }
}
