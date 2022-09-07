export interface UserGameSheetUpdateData {

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
}
