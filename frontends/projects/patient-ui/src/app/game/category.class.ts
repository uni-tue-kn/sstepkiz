import {
  DocumentCategory as DocumentCategory,
  GameCategory as GameCategory,
  Item,
} from "@sstepkiz";

/**
 * Manages information from the server and the document about the item states
 */

export class Category {
  constructor(
    private indexActiveMapCategory: number = 0,
    public allMapsCategoriesDocuments: DocumentCategory[] = [],
    public allServerCategories: GameCategory[] = []
  ) {
    this.mergeStatsItems();
  }

  /**
   * List of all items belonging to the entered/active map/continent
   * The indexActiveMapCategory is used to load all items corresponding a category
   *
   * Categoy e.g. = LA
   * */
  private activeMapCategoryDocuments =
    this.allMapsCategoriesDocuments[this.indexActiveMapCategory];

  /**
   * With this index all purchased serverCategoryItems are filtered according to the current map the user is in.
   *
   * The 'allServerCategories'-Array is a list of all purchased items independent of map
   * Then the allServerCategories items list is searched for the corresponding activeMapIndex
   *
   */
  private indexActiveServerCategory = this.allServerCategories.findIndex(
    (gameCategory) => gameCategory.indexDocument == this.indexActiveMapCategory
  );

  /**
   * List of bought items of this map/continent
   * This is the filtered list of purchased items which are related to the current active map
   */
  public activeServerCategory = this.allServerCategories[
    this.indexActiveServerCategory
  ]
    ? this.allServerCategories[this.indexActiveServerCategory].purchasedItems
    : [];

  /**
   * Is called on Angular onInit when user enters a map.
   * Updates the serverCategory arrays with the elements corresponding to the active map
   *
   * @param newServerCategorys contains all items the user has purchased.
   */
  setServerCategorys(newServerCategorys: GameCategory[]) {
    this.allServerCategories = newServerCategorys;
    this.indexActiveServerCategory = this.allServerCategories.findIndex(
      (category) => category.indexDocument == this.indexActiveMapCategory
    );
    this.activeServerCategory = this.allServerCategories[
      this.indexActiveServerCategory
    ]
      ? this.allServerCategories[this.indexActiveServerCategory].purchasedItems
      : [];
    this.mergeStatsItems();
  }
  /**
   * Method is called when user enteres into a map/continent.
   * Each continent is represented by an index number e.g. 0 = Latin Amerika
   *
   * The index is used to load all general available items in this map,
   * but also all already purchased items for this specific map.
   *
   * @param newMapIndex represents the index of the entered map.
   */
  changeCategory(newMapIndex: number) {
    this.indexActiveMapCategory = newMapIndex;
    this.activeMapCategoryDocuments =
      this.allMapsCategoriesDocuments[newMapIndex];
    this.indexActiveServerCategory = this.allServerCategories.findIndex(
      (category) => category.indexDocument == this.indexActiveMapCategory
    );
    this.activeServerCategory = this.allServerCategories[
      this.indexActiveServerCategory
    ]
      ? this.allServerCategories[this.indexActiveServerCategory].purchasedItems
      : [];

    this.mergeStatsItems();
  }

  mergeStatsItems() {
    this.activeServerCategory.forEach((purchasedItem: Item) => {
      let item =
        this.activeMapCategoryDocuments.items[purchasedItem.indexDocument];
      item.purchased = true;
      if (purchasedItem.active) {
        item.active = true;
      }
      if (item.w && item.h) {
        purchasedItem.w = item.w;
        purchasedItem.h = item.h;
      }
    });
  }

  get name(): String {
    return this.activeMapCategoryDocuments.name;
  }

  /**
   * Retrieves all objects/items which are available for the currently highest level.
   *
   * For clothing the items need to be filtered, otherwise all items in that specific
   * category would be returned, ignoring the current user country level.
   */
  getAllItemsDocument(isClothing: boolean, etape?: number): Item[] {
    var items = this.activeMapCategoryDocuments.items;
    if (isClothing) {
      items = this.activeMapCategoryDocuments.items.filter(
        (item: Item) => item.etape <= etape
      );
    }
    return items;
  }

  get backgroundImage(): String {
    return this.activeMapCategoryDocuments.image;
  }

  buyItem(index: number): void {
    this.activeMapCategoryDocuments.items[index].purchased = true;
    let newItem = this.activeMapCategoryDocuments.items[index];
    newItem.indexDocument = index;
    this.activeServerCategory.push(newItem);

    if (!this.allServerCategories[this.indexActiveServerCategory]) {
      this.allServerCategories.push({
        name: this.activeMapCategoryDocuments.name,
        indexDocument: this.indexActiveMapCategory,
        purchasedItems: this.activeServerCategory,
      });
    }
  }

  replaceItem(newItem: Item) {
    // In the wardrobe categories there is always only one active item
    const activeItemIndex = 0;
    if (this.activeItems.length > 0) {
      let oldItem = this.activeItems[activeItemIndex];
      this.toggleActive(oldItem);
    }
    this.toggleActive(newItem);
  }

  toggleActive(newItem: Item) {
    let itemIndex = this.activeServerCategory.findIndex(
      (item: { name: string }) => item.name == newItem.name
    );
    if (itemIndex != -1) {
      let item = this.activeServerCategory[itemIndex];
      let toggle = !item.active;
      this.activeServerCategory[itemIndex].active = toggle;
      this.activeMapCategoryDocuments.items[item.indexDocument].active = toggle;
    }
  }

  get activeItems(): Item[] {
    let items: Item[] = [];
    if (this.activeServerCategory) {
      items = this.activeServerCategory.filter((item: Item) => item.active);
    }
    return items;
  }

  get toSafeCategorys(): GameCategory[] {
    return this.allServerCategories;
  }
}
