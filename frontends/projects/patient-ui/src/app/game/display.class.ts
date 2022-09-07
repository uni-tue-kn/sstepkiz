import { Item } from "@sstepkiz";

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

/**
 * Manages display from the items.
 */
export class Display {
  constructor(public items: Item[] = [], private image: String = "") {}

  setActiveItems(items: Item[]) {
    this.items = items;
  }

  changeActiveItem(newItem: Item) {
    this.removeOutfitCategoryFromWardrobeDisplay(newItem);

    let index = this.items.findIndex(
      (item) => item.category == newItem.category
    );
    if (index == -1) {
      this.addActiveItem(newItem);
    } else {
      this.items.splice(index, 1, newItem);
    }

    this.items.forEach((item) => {
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

    this.items.sort((a, b) => a.z - b.z);
    console.log("items: ", this.items);
  }

  /**
   * When the user enters or navigates through the wardrobe menu, this method
   * removes the outfits which have been displayed. Otherwise, the outfits would hide
   * all other clothes in presentation.
   */
  private removeOutfitCategoryFromWardrobeDisplay(newItem: Item) {
    //remove all full body outfits
    for (var i = this.items.length - 1; i >= 0; i--) {
      if (this.items[i].category == "outfits") {
        this.items.splice(i, 1);
      }
    }

    //remove all inactive items
    for (const item of this.items) {
      if (item.category !== newItem.category && !item.active) {
        this.items.splice(this.items.indexOf(item), 1);
      }
    }

    for (const item of this.items) {
      if (item.category == newItem.category) {
        this.items.splice(this.items.indexOf(item), 1);
      }
    }

    //remove shirt, accessories and pants when new item is a full body outfit
    if (newItem.category == "outfits") {
      for (var i = this.items.length - 1; i >= 0; i--) {
        if (
          this.items[i].category == "top" ||
          this.items[i].category == "pants" ||
          this.items[i].category == "accessoires"
        ) {
          this.items.splice(i, 1);
        }
      }
    }
  }

  addActiveItem(item: Item) {
    this.items.push(item);
  }

  deleteActiveItem(hideItem: Item) {
    let index = this.items.findIndex((item) => item.name == hideItem.name);
    this.items.splice(index, 1);
  }

  get activeItems(): Item[] {
    return this.items.sort((a, b) => a.z - b.z);
  }

  setBackgroundImage(image: String) {
    this.image = image;
  }

  get backgroundImage(): String {
    return this.image;
  }
}
