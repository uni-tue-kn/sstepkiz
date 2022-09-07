import { IsNumber, IsString, MaxLength, IsOptional } from "class-validator";
import { GameCategory, Item, UserGameSheet } from "@sstepkiz/game";
import {  } from '@nestjs/common';

export class UserGameSheetDto implements UserGameSheet {
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
   * The number of coins the user has earned.
   */
  @IsOptional()
  @IsNumber()
  coins?: number;

  /**
  * The titles the user has earned.
  */
  @IsOptional()
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  titles?: string[];


  /**
    * The highest map that the user can enter.
    */

  @IsOptional()
  @IsNumber()
  highestMap?: number;

  @IsOptional()
  entertMaps?: GameCategory[];

  @IsOptional()
  purchasedClothes?: GameCategory[];

  @IsOptional()
  activeClothes?: Item[];


}
