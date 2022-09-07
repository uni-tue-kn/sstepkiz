import { Component, OnInit } from "@angular/core";
import { UserGameSheet } from "@sstepkiz";
import { AuthService } from "projects/auth/src/public-api";
import { Subscription } from "rxjs";
import { UserInformationService } from "../services/user-information.service";
@Component({
  selector: "app-dashboard",
  styleUrls: ["./dashboard.component.scss"],
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent implements OnInit {
  private intervalId?: number;

  private subscription: Subscription;

  userGameSheet: UserGameSheet;

  constructor(public readonly authService: AuthService, private userInformation: UserInformationService) {}

  /**
   * If the user is authenticated, the content is loaded and the interval is deleted, otherwise asked further.
   */
  auth() {
    if (this.authService.isAuthenticated) {
      this.loadInformation();
      clearInterval(this.intervalId);
    } else {
      console.log("not authenticated");
    }
  }

  /**
   * Loads user game sheet and sets user.
   */
  loadInformation() {
    this.userInformation.loadUserGameSheet();
    this.subscription = this.userInformation.userGameSheet.subscribe((data) => {
      this.userGameSheet = data;
    });
    this.userInformation.setUser();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  ngOnInit() {
    // If the user is not yet authenticated, he will be asked until he is.
    this.intervalId = setInterval(() => {
      this.auth();
    }, 1000);
  }
}
