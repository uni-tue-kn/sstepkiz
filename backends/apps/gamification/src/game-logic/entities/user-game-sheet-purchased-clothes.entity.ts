import { Column, Entity, Index, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserGameSheet } from './user-game-sheet.entity';


@Entity()
@Index(['id','userGameSheet', 'name'], { unique: true })
export class UserGameSheetPurchasedClothes {
  @PrimaryColumn({
    type: Number,
    generated: true,
  })
  id: number;

  @ManyToOne(
    type => UserGameSheet,
    userGameSheet => userGameSheet.purchasedClothes,
    { onDelete: 'CASCADE' },
  )
  userGameSheet: UserGameSheet;
  
 
  @Column()
  category: string;

  @Column()
  indexCategory: number;

  @Column()
  indexDocument: number;

  @Column()
  name: string;

  @Column()
  image: string;

  @Column()
  active: boolean;

  @Column()
  purchased: boolean;

  // @Column()
  // scale: number;

  // @Column()
  // x: number;

  // @Column()
  // y: number;


 
}
