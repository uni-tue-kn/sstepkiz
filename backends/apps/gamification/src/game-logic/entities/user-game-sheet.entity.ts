import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { UserGameSheetTitle } from './user-game-sheet-title.entity';
import { GameCategory, Item } from '@sstepkiz';
import { UserGameSheetPurchasedClothes } from './user-game-sheet-purchased-clothes.entity';
import { UserGameSheetEntertMaps } from './user-game-sheet-entert-maps.entity';

@Entity()
export class UserGameSheet {
  /**
   * Identity of target user.
   */
  @PrimaryColumn({
    length: 20,
    type: 'varchar',
  })
  targetUser: string;

  @Column()
  avatarName: string;

  @Column()
  currentTitle: string;

  @Column()
  coins: number;

  @Column()
  highestMap: number;

  @OneToMany((type) => UserGameSheetTitle, (title) => title.userGameSheet)
  titlesRefs: UserGameSheetTitle[];

  @OneToMany(
    (type) => UserGameSheetEntertMaps,
    (entertMaps) => entertMaps.userGameSheet,
  )
  entertMapsRefs: UserGameSheetEntertMaps[];

  @OneToMany(
    (type) => UserGameSheetPurchasedClothes,
    (purchasedClothes) => purchasedClothes.userGameSheet,
  )
  purchasedClothesRefs: UserGameSheetPurchasedClothes[];

  get titles() {
    if (this.titlesRefs) {
      return this.titlesRefs.map((t) => t.title);
    } else {
      return [];
    }
  }

  get purchasedClothes() {
    const purchasedClothes: GameCategory[] = [];
    this.purchasedClothesRefs.forEach((item) => {
      let index = purchasedClothes.findIndex(
        (category) => category.indexDocument == item.indexCategory,
      );
      if (index == -1) {
        purchasedClothes.push({
          name: item.category,
          indexDocument: item.indexCategory,
          purchasedItems: [item],
        });
      } else {
        purchasedClothes[index].purchasedItems.push(item);
      }
    });
    return purchasedClothes;
  }

  get entertMaps() {
    const entertMaps: GameCategory[] = [];
    this.entertMapsRefs.forEach((item) => {
      let index = entertMaps.findIndex(
        (category) => category.indexDocument == item.indexCategory,
      );
      if (index == -1) {
        entertMaps.push({
          name: item.category,
          indexDocument: item.indexCategory,
          purchasedItems: [item],
        });
      } else {
        entertMaps[index].purchasedItems.push(item);
      }
    });
    return entertMaps;
  }

  get activeClothes() {
    const activeClothes: Item[] = [];
    this.purchasedClothesRefs.forEach((i) => {
      if (i.active) {
        activeClothes.push({
          active: true,
          category: i.category,
          indexDocument: i.indexDocument,
          image: i.image,
          name: i.name,
          purchased: true,
        });
      }
    });
    return activeClothes;
  }
}
