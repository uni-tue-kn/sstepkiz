import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {DocumentCategory, Item, UserGameSheet} from "@sstepkiz";

import {UserInformationService} from "../../services/user-information.service";
import {Subscription} from "rxjs";
import {GameService} from "../game-service.service";
import {Display} from "../display.class";
import {Category} from "../category.class";
import {CdkDragEnd, CdkDragStart} from "@angular/cdk/drag-drop";
import {MatDialog} from "@angular/material/dialog";
import {NorthAmerikaPlaceDialogComponent} from "./north-amerika-place-dialog/north-amerika-place-dialog.component";

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
  selector: "app-game-map",
  styleUrls: ["./game-map.component.scss"],
  templateUrl: "./game-map.component.html",
})
export class GameMapComponent implements OnInit, OnDestroy {
  isNorthAmerica: boolean = false;

  avatarItems: Item[];

  avatarPath: string = "../../assets/game/wardrobe/";

  activeClothes: Item[] = [];

  backgroundImage: string;

  category: Category = new Category(0, MAPS);

  display: Display = new Display();

  index: number;

  itemIndex: number = 0;

  path = "../../../assets/game/";

  subscriptions: Subscription[] = [];

  userGameSheet: UserGameSheet;

  isDragging: boolean = false;

  constructor(
    private gameService: GameService,
    private route: ActivatedRoute,
    public userInformation: UserInformationService,
    public dialog: MatDialog
  ) {
    this.subscriptions.push(
      this.route.params.subscribe((params) => {
        this.index = params.index;
      })
    );
  }

  async buy(item: Item): Promise<void> {
    this.category.buyItem(item.indexDocument);
    this.userGameSheet.coins = this.userGameSheet.coins - item.cost;
    await this.gameService.buyItems(
      this.category.toSafeCategorys,
      this.userGameSheet.coins
    );
  }

  northAmericaPlaceClick(itemIndex: number)  {
    console.log("clicked item index number: ", itemIndex);
    let items: Item[] = this.category.getAllItemsDocument(false);
    const matchingIndexItem: Item[] = items.filter((item) => item.indexDocument == itemIndex);
    if (matchingIndexItem.length > 0 && matchingIndexItem[0].purchased) {
      this.openImageDialog((matchingIndexItem[0]));
    }
  }
  openImageDialog(item: Item) {
    const dialogRef = this.dialog.open(NorthAmerikaPlaceDialogComponent, {
      width: "600px",
      data: {
        imagePath: item.image
      }
    });
    dialogRef.afterClosed();
  }


  dragStart($event: CdkDragStart) {
    $event.event.preventDefault();
    this.isDragging = true;
    document.body.style.overflow = "hidden";
  }

  dragEnd($event: CdkDragEnd, item: Item) {
    $event.event.preventDefault();

    document.body.style.overflow = "auto";
    let position = $event.source.getFreeDragPosition();
    item.x = Math.floor(position.x);
    item.y = Math.floor(position.y);
    this.safe();
    this.isDragging = false;
  }

  insert(item: Item): void {
    this.display.addActiveItem(item);
    this.category.toggleActive(item);
    this.safe();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.userInformation.loadUserGameSheet();
  }

  ngOnInit() {
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
        this.category.setServerCategorys(this.userGameSheet.entertMaps);
        this.category.changeCategory(this.index);
        this.display.setActiveItems(this.category.activeItems);
        this.display.setBackgroundImage(this.category.backgroundImage);
        this.dressAvatarDefault(this.userGameSheet.activeClothes);
        this.isNorthAmerica = this.index == 4;
      })
    );
    this.userInformation.loadUserGameSheet();
  }

  /**
   * Dress the avatar with default clothes, if no clothes present
   */
  dressAvatarDefault(activeGameSheetClothes: Item[]) {
    this.activeClothes = [];
    this.activeClothes.push(...this.userGameSheet.activeClothes);
    //search for missing items
    let missingItemCategories: string[] = [
      "hairstyle",
      "top",
      "pants",
      "shoes",
    ];

    for (const item of activeGameSheetClothes) {
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
          this.activeClothes.push(WARDROBE_DEFAULT[0].items[0]);
          break;

        case "top":
          this.activeClothes.push(WARDROBE_DEFAULT[1].items[0]);
          break;

        case "pants":
          this.activeClothes.push(WARDROBE_DEFAULT[2].items[0]);
          break;

        case "shoes":
          this.activeClothes.push(WARDROBE_DEFAULT[3].items[0]);
          break;
      }
    });

    this.activeClothes.forEach((item) => {
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
  }

  remove(item: Item): void {
    this.display.deleteActiveItem(item);
    this.category.toggleActive(item);
    this.safe();
  }

  safe(): void {
    this.display.activeItems.forEach((element) => {
      let item = this.category.activeItems.find(
        (item) => item.name == element.name
      );
      item.x = Math.round(element.x);
      item.y = Math.round(element.y);
    });
    this.gameService.safeItems(this.category.toSafeCategorys);
  }

  isUnlocked(id: number): boolean  {
    let items: Item[] = this.category.getAllItemsDocument(false).filter((item) => item.indexDocument == id);
    if (items.length > 0)  {
      return items[0].purchased;
    }
    return false;
  }
}
