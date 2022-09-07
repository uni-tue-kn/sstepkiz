import {Component, HostListener, OnDestroy, OnInit} from "@angular/core";
import {LocationStrategy} from "@angular/common";
import {Subscription} from "rxjs";
import {ContextSchedule, ExtendObservations, Instrument, Result, ResultPoint, UserGameSheet,} from "@sstepkiz";
import {ImeraApiService} from "projects/imera-api/src/public-api";
import {ActivatedRoute, Router} from "@angular/router";

import {GameService} from "../../game/game-service.service";
import {UserInformationService} from "../../services/user-information.service";
import {HotToastService} from "@ngneat/hot-toast";

@Component({
  selector: "app-context-page",
  templateUrl: "./survey-page.component.html",
  styleUrls: ["./survey-page.component.scss"],
})
export class SurveyPageComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  subscriptions: Subscription[] = [];
  routerLinkBack: string = "";

  @HostListener("window:popstate", ["$event"])
  handleBackPressed(event: Event) {
    console.log("event: ", event);
    event.preventDefault();
  }

  beforeUnloadListener;

  instruments: Instrument[];
  observations: ExtendObservations[];
  title: string;

  contextId: number;
  result: Result;
  resultPoints: ResultPoint[] = [];
  resultContextType = { id: 1, name: "Frage" };
  isSendingResults: boolean = false;

  contextSchedule: ContextSchedule;
  userGameSheet: UserGameSheet;
  coins: number = 50;
  reward: number = 30;

  constructor(
    private imeraApiService: ImeraApiService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserInformationService,
    private gameService: GameService,
    private toast: HotToastService,
    private locationStrategie: LocationStrategy
  ) {
    this.isLoading = true;
    this.subscriptions.push(
      this.route.params.subscribe((params) => {
        this.subscriptions.push(
          this.imeraApiService
            .getContextScheduleById(params.id)
            .subscribe((data) => {
              this.contextSchedule = data;
              this.contextId = data.context.id;
              this.subscriptions.push(
                this.imeraApiService
                  .getObservationsByContextId(String(this.contextId))
                  .subscribe((data) => {
                    console.log("data: ", data);
                    this.subscriptions.push(
                      this.imeraApiService
                        .extendObservations(data)
                        .subscribe((data) => {
                          this.observations = data;
                          this.title = this.observations[0].context.name;
                          this.instruments =
                            this.imeraApiService.getInstruments(
                              this.observations
                            );
                          this.result = new Result(
                            { id: this.userService.user.id },
                            {
                              id: this.contextId,
                              contextType: this.resultContextType,
                            },
                            this.resultPoints
                          );

                          //coins
                          if (
                            this.observations !== null &&
                            this.observations !== undefined
                          ) {
                            //determine coin value
                            //this.coins = this.observations.length;
                            this.coins = 60;
                          }
                          this.isLoading = false;
                        })
                    );
                  })
              );
            })
        );
      })
    );
    this.userService.userGameSheet.subscribe((data) => {
      this.userGameSheet = data;
    });
  }

  /**
   * Sends the results of the survey to Imera, updates the score and deletes the survey from the patient's calendar.
   */
  send(resultPoints: ResultPoint[]): void {
    if (resultPoints !== null && resultPoints !== undefined) {
      this.isSendingResults = true;
      this.result.resultPoints = resultPoints;

      this.imeraApiService
        .postNewResult(this.result)
        .then((data) => {
          this.imeraApiService
            .deleteContextSchedule(this.contextSchedule.id)
            .toPromise();

          this.imeraApiService.getFilteredResult().then((results) => {
            this.userService.setResults(results);

            let etape = this.gameService.calcEtape(
              this.userService.results.length
            );
            if (
              this.userGameSheet !== null &&
              this.userGameSheet !== undefined
            ) {
              if (etape != this.userGameSheet.highestMap) {
                // Anzeige
                this.userService.updateGameSheetCoreData({
                  coins: this.userGameSheet.coins + this.coins,
                  highestMap: etape,
                });
                this.router.navigate([this.routerLinkBack]);
              } else {
                this.userService.updateGameSheetCoreData({
                  coins: this.userGameSheet.coins + this.coins,
                });
                this.router.navigate([this.routerLinkBack]);
              }
            } else {
              this.router.navigate([this.routerLinkBack]);
            }
            this.isSendingResults = false;
          });
        })
        .catch((error) => {
          console.error(error);
          this.toast.error("Das hat leider nicht funktioniert! Tut uns leid!");
          this.isSendingResults = false;
        });
    } else {
      this.router.navigate([this.routerLinkBack]);
    }
  }

  ngOnInit(): void {
    this.beforeUnloadListener = (event) => {
      event.preventDefault();
      return (event.returnValue = "Bist Du dir sicher?");
    };

    addEventListener("beforeunload", this.beforeUnloadListener, true);
  }

  ngOnDestroy() {
    removeEventListener("beforeunload", this.beforeUnloadListener, true);
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
