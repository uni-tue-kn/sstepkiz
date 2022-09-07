import { UserGameSheetUpdateData } from "@sstepkiz";
import { IsNumber, IsString, MaxLength, IsOptional } from "class-validator";

export class UserGameSheetUpdateDataDto implements UserGameSheetUpdateData {

  /**
     * Name the user chose.
     */
  @IsOptional()
  @IsString()
  @MaxLength(30)
  avatarName?: string;

  /**
   * The title the user chose to display by his avatar name.
   */
  @IsOptional()
  @IsString()
  currentTitle?: string;

  /**
   * The number of coins  the user has earned.
   */
  @IsOptional()
  @IsNumber()
  coins?: number;

  /**
  * The highest map that the user can enter.
  */

  @IsOptional()
  @IsNumber()
  highestMap?: number;

}
