import { Item } from "./item.interface";
import { GameCategory } from "./gameCategory.interface";

export interface UserGameSheet {
  id?: string;

  /**
   * Name the user chose.
   */
  avatarName?: string;

  /**
   * The title the user chose to display by his avatar name.
   */
  currentTitle?: string;

  /**
   * The number of coins the user has earned.
   */
  coins?: number;

  /**
   * highest Map the user can enter.
   */
  highestMap?: number;

  /**
   * All titles the user has bought.
   */
  titles?: string[];

  /**
   * All maps the user has entert. With the items the user has bored.
   */
  entertMaps?: GameCategory[];

  /**
   * All clothes the user has bored.
   */
  purchasedClothes?: GameCategory[];

  /**
   * All clothes the avatar is wearing.
   */
  activeClothes?: Item[];
}
