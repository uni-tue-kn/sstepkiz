import {Component} from "@angular/core";
import {DocumentCategory, Item, UserGameSheet} from "@sstepkiz";
import {Subscription} from "rxjs";

import {UserInformationService} from "../../services/user-information.service";
import {HotToastService} from "@ngneat/hot-toast";

declare const MAPS: any;

/**
 * default clothing of the avatar
 */
declare const WARDROBE_DEFAULT: DocumentCategory[];

const Z_VALUE_ACCESSOIRES = {
  category: "accessoires",
  level: 15,
};
const Z_VALUE_OUTFITS = {
  category: "outfits",
  level: 14,
};
const Z_VALUE_SHOES = {
  category: "shoes",
  level: 2,
};
const Z_VALUE_PANTS = {
  category: "pants",
  level: 3,
};
const Z_VALUE_TOP = {
  category: "top",
  level: 4,
};
const Z_VALUE_HAIRSTYLE = {
  category: "hairstyle",
  level: 13,
};

@Component({
  selector: "app-game-header",
  styleUrls: ["./game-header.component.scss"],
  templateUrl: "./game-header.component.html",
})
export class GameHeaderComponent {
  background: string;

  imageLink: string;

  link: string = "/game";

  subscriptions: Subscription[] = [];

  userGameSheet: UserGameSheet;

  // BKU TODO  Title Feature <see progress.component.html for information>
  //showTitlePrefix: boolean;

  constructor(
    private userInformation: UserInformationService,
    private toast: HotToastService
  ) {
    console.log("game header constructor");
    this.subscriptions.push(
      this.userInformation.userGameSheet.subscribe((data) => {
        if (data !== null && data !== undefined) {
          if (Object.entries(data).length === 0) {
            this.userGameSheet = JSON.parse(sessionStorage.getItem("usergame"));
          } else {
            this.userGameSheet = data;
            //this.sortActiveClothesOnAvatar(this.userGameSheet.activeClothes);
            this.styleActiveClothesOnAvatar(this.userGameSheet.activeClothes);
            sessionStorage.setItem(
              "usergame",
              JSON.stringify(this.userGameSheet)
            );
          }
        } else {
          this.toast.error("Das hat leider nicht funktioniert! Tut uns leid!");
        }
        this.imageLink = MAPS[this.userGameSheet.highestMap].image;
        this.background = `background-image: url('../../assets/game/${this.imageLink}');`;
      })
    );
  }

  styleActiveClothesOnAvatar(activeClothes: Item[]): Item[] {
    //search for missing items
    let missingItemCategories: string[] = [
      "hairstyle",
      "top",
      "pants",
      "shoes",
    ];

    for (const item of activeClothes) {
      switch (item.category) {
        case "hairstyle":
          missingItemCategories.splice(
            missingItemCategories.indexOf("hairstyle"),
            1
          );
          break;

        case "top":
          missingItemCategories.splice(missingItemCategories.indexOf("top"), 1);
          break;

        case "pants":
          missingItemCategories.splice(
            missingItemCategories.indexOf("pants"),
            1
          );
          break;

        case "shoes":
          missingItemCategories.splice(
            missingItemCategories.indexOf("shoes"),
            1
          );
          break;

        case "outfits":
          missingItemCategories.splice(missingItemCategories.indexOf("top"), 1);
          missingItemCategories.splice(
            missingItemCategories.indexOf("pants"),
            1
          );
          missingItemCategories.splice(
            missingItemCategories.indexOf("shoes"),
            1
          );
          break;
      }
    }

    //dress default
    missingItemCategories.forEach((category: string) => {
      switch (category) {
        case "hairstyle":
          activeClothes.push(WARDROBE_DEFAULT[0].items[0]);
          break;

        case "top":
          activeClothes.push(WARDROBE_DEFAULT[1].items[0]);
          break;

        case "pants":
          activeClothes.push(WARDROBE_DEFAULT[2].items[0]);
          break;

        case "shoes":
          activeClothes.push(WARDROBE_DEFAULT[3].items[0]);
          break;
      }
    });

    activeClothes.forEach((item) => {
      switch (item.category) {
        case Z_VALUE_HAIRSTYLE.category:
          item.z = Z_VALUE_HAIRSTYLE.level;
          break;
        case Z_VALUE_TOP.category:
          item.z = Z_VALUE_TOP.level;
          break;
        case Z_VALUE_PANTS.category:
          item.z = Z_VALUE_PANTS.level;
          break;
        case Z_VALUE_SHOES.category:
          item.z = Z_VALUE_SHOES.level;
          break;
        case Z_VALUE_ACCESSOIRES.category:
          item.z = Z_VALUE_ACCESSOIRES.level;
          break;
        case Z_VALUE_OUTFITS.category:
          item.z = Z_VALUE_OUTFITS.level;
          break;
        default:
          item.z = undefined;
      }
    });
    return this.userGameSheet.activeClothes.sort((a, b) => a.z - b.z);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
