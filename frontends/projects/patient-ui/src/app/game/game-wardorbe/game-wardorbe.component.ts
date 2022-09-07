import { Component, OnDestroy, OnInit } from "@angular/core";
import { DocumentCategory, Item, UserGameSheet } from "@sstepkiz";
import { Subscription } from "rxjs";

import { UserInformationService } from "../../services/user-information.service";
import { Category } from "../category.class";
import { Display } from "../display.class";
import { GameService } from "../game-service.service";

declare const WARDROBE: DocumentCategory[];

@Component({
  selector: "app-game-wardorbe",
  styleUrls: ["./game-wardorbe.component.scss"],
  templateUrl: "./game-wardorbe.component.html",
})
export class GameWardorbeComponent implements OnInit, OnDestroy {
  category: Category = new Category(0, WARDROBE);

  display: Display = new Display();

  itemIndex: number = 0;
  /**
   * scaledItemIndex: the item index of the filtered allItemsDocument
   */
  scaledItemIndex: number = 0;

  subscriptions: Subscription[] = [];

  userGameSheet: UserGameSheet;

  wardrobe: DocumentCategory[] = WARDROBE;

  constructor(
    private gameService: GameService,
    private userInformation: UserInformationService
  ) {}

  async buy(item: Item, index: number) {
    console.log("buying item: ", item);
    this.category.buyItem(index);
    this.userGameSheet.coins = this.userGameSheet.coins - item.cost;
    await this.gameService.buyClothes(
      this.category.toSafeCategorys,
      this.userGameSheet.coins
    );
  }

  insert(item: Item) {
    this.display.changeActiveItem(item);
    this.category.replaceItem(item);

    //undress every active item unless shoes, if item is a whole outfit
    if (item.category == "outfits") {
      this.category.allMapsCategoriesDocuments.forEach((category) => {
        if (
          category.category !== "hairstyle" &&
          category.category !== "outfits"
        ) {
          category.items.forEach((item) => {
            if (item.active) {
              item.active = false;
            }
          });
        }
      });

      this.category.allServerCategories.forEach((category) => {
        if (category.name !== "hairstyle" && category.name !== "outfits") {
          category.purchasedItems.forEach((item) => {
            if (item.active) {
              item.active = false;
            }
          });
        }
      });
    } else if (item.category !== "hairstyle") {
      this.category.allMapsCategoriesDocuments[
        this.category.allMapsCategoriesDocuments.findIndex(
          (category) => category.category == "outfits"
        )
      ].items.forEach((item) => {
        if (item.active) {
          item.active = false;
        }
      });

      let outfitsIndex = this.category.allServerCategories.findIndex(
        (category) => category.name == "outfits"
      );
      if (outfitsIndex !== -1) {
        this.category.allServerCategories[outfitsIndex].purchasedItems.forEach(
          (purchasedItem) => {
            if (purchasedItem.active) {
              purchasedItem.active = false;
            }
          }
        );
      }
    }
    this.safe();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.userInformation.loadUserGameSheet();
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.userInformation.userGameSheet.subscribe((data) => {
        if (Object.entries(data).length === 0) {
          this.userGameSheet = JSON.parse(sessionStorage.getItem("usergame"));
        } else {
          this.userGameSheet = data;
          sessionStorage.setItem(
            "usergame",
            JSON.stringify(this.userGameSheet)
          );
        }

        this.category.setServerCategorys(this.userGameSheet.purchasedClothes);
        this.display.setActiveItems(this.userGameSheet.activeClothes);
        this.display.setBackgroundImage(this.category.backgroundImage);

        //init item index and preview first item
        const items = this.category.getAllItemsDocument(
          true,
          this.userGameSheet.highestMap
        );
        this.itemIndex = this.category
          .getAllItemsDocument(false)
          .indexOf(items[this.scaledItemIndex]);
        this.preview(items[this.scaledItemIndex]);
      })
    );
    //reload user game sheet observable
    this.userInformation.loadUserGameSheet();
  }

  preview(item: Item) {
    this.category.allServerCategories.forEach((category) => {
      category.purchasedItems.forEach((element) => {
        if (element.active && !this.display.items.includes(element)) {
          this.display.items.push(element);
        }
      });
    });

    this.display.changeActiveItem(item);
  }

  remove(item: Item) {
    this.display.deleteActiveItem(item);
    this.category.toggleActive(item);
    this.safe();
  }

  safe() {
    this.gameService.safeClothes(this.category.toSafeCategorys);
  }

  selectCategory(index: number) {
    this.category.changeCategory(index);
    //update item index and scaled item index
    this.scaledItemIndex = 0;
    const items = this.category.getAllItemsDocument(
      true,
      this.userGameSheet.highestMap
    );
    this.itemIndex = this.category
      .getAllItemsDocument(false)
      .indexOf(items[this.scaledItemIndex]);
    this.preview(
      this.category.getAllItemsDocument(true, this.userGameSheet.highestMap)[
        this.scaledItemIndex
      ]
    );
  }

  onItemChanged(increment: boolean) {
    if (increment) {
      this.scaledItemIndex++;
    } else {
      this.scaledItemIndex--;
    }
    const items = this.category.getAllItemsDocument(
      true,
      this.userGameSheet.highestMap
    );
    this.itemIndex = this.category
      .getAllItemsDocument(false)
      .indexOf(items[this.scaledItemIndex]);
    this.preview(items[this.scaledItemIndex]);
  }
}
