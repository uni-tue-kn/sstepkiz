import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserGameSheet } from '@sstepkiz';
import { Repository } from 'typeorm';
import { UserGameSheet as UserGameSheetEntity } from '../entities/user-game-sheet.entity';
import { UserGameSheetTitle as UserGameSheetTitleEntity } from '../entities/user-game-sheet-title.entity';
import { UserGameSheetEntertMaps as UserGameSheetEntertMapsEntity } from '../entities/user-game-sheet-entert-maps.entity';
import { UserGameSheetPurchasedClothes as UserGameSheetPurchasedClothesEntity } from '../entities/user-game-sheet-purchased-clothes.entity';
import { UserGameSheetDto } from '../dtos/user-game-sheet.dto';
import { UserGameSheetUpdateDataDto } from '../dtos/user-game-sheet-update-data.dto';

@Injectable()
export class GameLogicService {
  constructor(
    @InjectRepository(UserGameSheetEntity)
    private readonly gameSheetRepository: Repository<UserGameSheetEntity>,

    @InjectRepository(UserGameSheetTitleEntity)
    private readonly gameSheetTitleRepository: Repository<UserGameSheetTitleEntity>,

    @InjectRepository(UserGameSheetPurchasedClothesEntity)
    private readonly gameSheetPurchasedClothesRepository: Repository<UserGameSheetPurchasedClothesEntity>,
    @InjectRepository(UserGameSheetEntertMapsEntity)
    private readonly gameSheetEntertMapsRepository: Repository<UserGameSheetEntertMapsEntity>,
  ) {}

  /**
   * Creats a new user with an empty sheet.
   * @param targetUser
   * @returns
   */
  async createFirstSheet(targetUser: string): Promise<UserGameSheet> {
    let newSheet = {
      avatarName: 'Wähle einen Namen',
      currentTitle: '',
      coins: 0,
      highestMap: 0,
      titles: [],
      purchasedClothes: [],
      entertMaps: [],
      activeClothes: [],
    };
    return this.createNewGameSheet(targetUser, newSheet);
  }

  async createNewGameSheet(
    targetUser: string,
    newSheet: UserGameSheet,
  ): Promise<UserGameSheet> {
    const gameSheet = new UserGameSheetEntity();

    gameSheet.avatarName = newSheet.avatarName;
    gameSheet.currentTitle = newSheet.currentTitle;
    gameSheet.coins = newSheet.coins;
    gameSheet.targetUser = targetUser;
    gameSheet.highestMap = newSheet.highestMap;

    const sheet = await this.gameSheetRepository.save(gameSheet);

    if (newSheet.titles) {
      for (const title of newSheet.titles) {
        const newTitle = new UserGameSheetTitleEntity();
        newTitle.userGameSheet = sheet;
        newTitle.title = title;
        await this.gameSheetTitleRepository.save(newTitle);
      }
    }

    if (newSheet.entertMaps) {
      for (const element of newSheet.entertMaps) {
        for (const item of element.purchasedItems) {
          const newitem = new UserGameSheetEntertMapsEntity();
          newitem.userGameSheet = sheet;
          newitem.active = item.active;
          newitem.category = item.category;
          newitem.indexCategory = element.indexDocument;
          newitem.indexDocument = item.indexDocument;
          newitem.image = item.image;
          newitem.name = item.name;
          newitem.x = item.x;
          newitem.y = item.y;
          newitem.purchased = item.purchased;
          await this.gameSheetEntertMapsRepository.save(newitem);
        }
      }
    }

    if (newSheet.purchasedClothes) {
      for (const purchasedCloth of newSheet.purchasedClothes) {
        for (const item of purchasedCloth.purchasedItems) {
          const newitem = new UserGameSheetPurchasedClothesEntity();
          newitem.userGameSheet = sheet;
          newitem.category = item.category;
          newitem.indexCategory = purchasedCloth.indexDocument;
          newitem.indexDocument = item.indexDocument;
          newitem.name = item.name;
          newitem.image = item.image;
          newitem.active = item.active;
          newitem.purchased = item.purchased;
          await this.gameSheetPurchasedClothesRepository.save(newitem);
        }
      }
    }

    return await this.findUserSheet(targetUser);
  }

  /**
   * Only updates the values in User_Game_Sheet not the dependencies.
   * Use for update: Name, currentTitle, highestMap, coins
   * @param targetUser
   * @param toUpdateValues
   */
  async updateGameSheetCoreData(
    targetUser: string,
    toUpdateValues: UserGameSheetUpdateDataDto,
  ) {
    const gameSheet: UserGameSheetEntity = new UserGameSheetEntity();
    gameSheet.targetUser = targetUser;
    const oldSheet = await this.findUserSheet(targetUser);
    gameSheet.avatarName = oldSheet.avatarName;
    gameSheet.currentTitle = oldSheet.currentTitle;
    gameSheet.coins = oldSheet.coins;
    gameSheet.highestMap = oldSheet.highestMap;
    for (const key of Object.getOwnPropertyNames(toUpdateValues)) {
      gameSheet[key] = toUpdateValues[key];
    }
    await this.gameSheetRepository.save(gameSheet);
    return await this.findUserSheet(targetUser);
  }

  /**
   * Updates every entrie in den toUpdateValue object.
   * User_Game_Sheet and dependencies
   * If old gameSheet cant be found, creates new one.
   * Use for update: Clothes, Maps, Titles, activeClothes
   * @param targetUser
   * @param key
   * @param toUpdateValue {key: value, ....} key name in database
   */
  async updateGameSheetAllData(
    targetUser: string,
    toUpdateValue: UserGameSheetDto,
  ) {
    var gameSheet: UserGameSheet = await this.findUserSheet(targetUser);

    if (gameSheet == null || gameSheet == undefined) {
      gameSheet = await this.createFirstSheet(targetUser);
    }

    for (const key of Object.getOwnPropertyNames(toUpdateValue)) {
      gameSheet[key] = toUpdateValue[key];
    }
    await this.removeUserGameSheet(targetUser);
    gameSheet = await this.createNewGameSheet(targetUser, gameSheet);
    return gameSheet;
    //return await this.createNewGameSheet(targetUser, gameSheet);
  }

  async newMap(targetUser: string, mapNumber: number) {
    const gameSheet: UserGameSheet = await this.findUserSheet(targetUser);
    gameSheet.highestMap = mapNumber;
    await this.gameSheetRepository.save(gameSheet);
    return await this.findUserSheet(targetUser);
  }

  /**
   * Gets if a user game sheet exists.
   * @param targetUser Identity of target user.
   * @returns true = exists, false = not exists.
   */
  async existsConfiguration(targetUser: string): Promise<boolean> {
    return !!(await this.gameSheetRepository.findOne({
      where: { targetUser },
    }));
  }

  /**
   * Gets a user game sheet by the identity of the target user.
   * @param targetUser Identity of target user.
   * @returns Found user game sheet or undefined if not found.
   */
  async findUserSheet(targetUser: string): Promise<UserGameSheet | undefined> {
    // Get user game sheet from database with all its relations.
    const sheet = await this.gameSheetRepository.findOne({
      relations: ['titlesRefs', 'entertMapsRefs', 'purchasedClothesRefs'],
      where: { targetUser },
    });

    // Ensure that user game sheet was found or return undefined.
    if (!sheet) return undefined;
    // Extract required values form user game sheet and return them.
    return {
      id: targetUser,
      avatarName: sheet.avatarName,
      currentTitle: sheet.currentTitle,
      coins: sheet.coins,
      highestMap: sheet.highestMap,
      titles: sheet.titles,
      entertMaps: sheet.entertMaps,
      purchasedClothes: sheet.purchasedClothes,
      activeClothes: sheet.activeClothes,
    };
  }

  async removeUserGameSheet(targetUser: string): Promise<void> {
    // Remove the matching user game sheet.
    // Related upload times will be deleted by the DBMS automatically due to the ON DELETE: CASCADE statement.
    await this.gameSheetRepository.delete({ targetUser });
  }

  /**
   * Gets all existing user identities form data table GameSheet.
   * @returns Array of Identities of target users of GameSheet.
   */
  async findAllUsers(): Promise<string[]> {
    // Get identities from database.
    const result = await this.gameSheetRepository.find({
      select: ['targetUser'],
    });
    // Map identities from result array to string array and return it.
    return result.map((r) => r.targetUser);
  }
}
