import { Column, Entity, Index, ManyToOne, PrimaryColumn } from 'typeorm';

import { UserGameSheet } from './user-game-sheet.entity';

@Entity()
@Index(['id', 'userGameSheet', 'title'], { unique: true })
export class UserGameSheetTitle {
  @PrimaryColumn({
    type: Number,
    generated: true,
  })
  id: number;

  @ManyToOne(
    type => UserGameSheet,
    userGameSheet => userGameSheet.titles,
    { onDelete: 'CASCADE' },
  )
  userGameSheet: UserGameSheet;

  @Column()
  title: string;

  // /**
  //  * Constructs a new Aggregator Upload time.
  //  * @param defaultValues Default values to apply to new instance.
  //  */
  // constructor(defaultValues?: Partial<UserGameSheetTitle>) {
  //   if (defaultValues) {
  //     Object.assign(this, defaultValues);
  //   }
  // }
}
