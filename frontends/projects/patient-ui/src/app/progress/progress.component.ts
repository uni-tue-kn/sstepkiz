import { Component, OnDestroy, OnInit } from "@angular/core";
import { UserGameSheet } from "@sstepkiz";
import { Subscription } from "rxjs";

import { ImeraApiService } from "../../../../imera-api/src/public-api";
import { UserInformationService } from "../services/user-information.service";

@Component({
  selector: "app-progress",
  styleUrls: ["./progress.component.scss"],
  templateUrl: "./progress.component.html",
})
export class ProgressComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];

  userGameSheet: UserGameSheet;

  sendingRequest = false;

  constructor(
    public userInformation: UserInformationService,
    public imeraServic: ImeraApiService
  ) {}

  edit() {
    this.sendingRequest = true;
    this.userInformation.updateGameSheetCoreData(
      {
        avatarName: this.userGameSheet.avatarName,
      },
      (data) => {
        this.sendingRequest = false;
      }
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.userInformation.userGameSheet.subscribe((data) => {
        this.userGameSheet = data;
      })
    );
  }
}
