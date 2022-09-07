import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { UserGameSheet } from "@sstepkiz";
import { Subscription } from "rxjs";

import { UserInformationService } from "../../services/user-information.service";
import { GameService } from "../game-service.service";

declare var MAPS: any;

@Component({
  selector: "app-game-overview",
  styleUrls: ["./game-overview.component.scss"],
  templateUrl: "./game-overview.component.html",
})
export class GameOverviewComponent implements OnInit {
  activeMaps: Array<number>;

  colorUnlocked: string = "#b5d932";

  inactiveMaps: Array<number>;

  maps = MAPS;

  subscriptions: Subscription[] = [];

  userGameSheet: UserGameSheet;

  constructor(
    private gameService: GameService,
    private router: Router,
    private userService: UserInformationService
  ) {}

  async ngOnInit() {
    this.subscriptions.push(
      this.userService.userGameSheet.subscribe((data) => {
        this.userGameSheet = data;
        this.activeMaps = this.userGameSheet.highestMap
          ? [...Array(this.userGameSheet.highestMap + 1).keys()]
          : [0];
        console.log("active maps: ", this.activeMaps);
        this.inactiveMaps = [...Array(this.gameService.maxEtape).keys()].filter(
          (item) => !this.activeMaps.includes(item)
        );
        console.log("inactive maps: ", this.inactiveMaps);
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  route(map: number) {
    this.router.navigate(["/map", map]);
  }
}
