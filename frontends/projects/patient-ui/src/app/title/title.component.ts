import { Component } from "@angular/core";
import { UserGameSheet } from "@sstepkiz";
import { UserInformationService } from "../services/user-information.service";

declare const TITLE: { title: string; price: number }[];

@Component({
  selector: "app-title",
  styleUrls: ["./title.component.scss"],
  templateUrl: "./title.component.html",
})
export class TitleComponent {
  newTitles = [];
  userGameSheet: UserGameSheet;
  allTitle = TITLE;

  constructor(public userService: UserInformationService) {
    this.userService.userGameSheet.subscribe((data) => {
      (this.userGameSheet = data), this.getNewTitle();
    });
  }

  getNewTitle() {
    this.newTitles = [];
    let numberOfTotalTitles = this.allTitle.length;
    if (this.userGameSheet.titles != undefined) {
      for (let index = 0; index < numberOfTotalTitles && this.newTitles.length < numberOfTotalTitles; index++) {
        if (!this.userGameSheet.titles.includes(this.allTitle[index].title)) {
          this.newTitles.push(this.allTitle[index]);
        }
      }
    }
  }
  /**
   * Validates if the title text is my current title.
   * Button text is displayed accordingly.
   */
  isAvailableTitleMyCurrentTitle(title: string): boolean {
    return this.userGameSheet.currentTitle === title;
  }

  /**
   * Title is bought and afterwards available in 'Deine Title'
   *
   * @param title
   * @param price
   */
  async buyTitle(title: string, price: number): Promise<void> {
    const titles: string[] = this.userGameSheet.titles;
    titles.push(title);
    this.userService.updateGameSheetAllData({ titles, coins: this.userGameSheet.coins - price });
    this.getNewTitle();
  }

  /**
   * Uses the title if the user clicks on use title button.
   *
   * @param title
   */
  changeTitle(title: string): void {
    this.userService.updateGameSheetCoreData({ currentTitle: title });
  }

  /**
   * Resets the title when the user clicks on remove title.
   *
   * @param title
   */
  removeTitle(title: string): void {
    if (this.userGameSheet.currentTitle === title) {
      this.userService.updateGameSheetCoreData({ currentTitle: "" });
    }
  }
}
