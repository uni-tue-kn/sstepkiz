import { Item } from "./item.interface";

export interface GameCategory {
  name: String;
  indexDocument: number;
  purchasedItems: Item[];
}
