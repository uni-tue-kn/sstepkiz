import { PermissionDescription } from '@sstepkiz';
import { Column, Entity, Index, ManyToOne, PrimaryColumn } from 'typeorm';

import { User } from './user.entity';

@Entity()
@Index(['subject', 'target'], { unique: true })
export class Permissions {
  /**
   * If the target ist allowed to access ECG data.
   * @default false
   */
  @Column({ default: false })
  ecg: boolean;

  /**
   * If the target is allowed to access EDA data.
   * @default false
   */
  @Column({ default: false })
  eda: boolean;

  /**
   * If the target is allowed to access eyetracking data.
   * @default false
   */
  @Column({ default: false })
  eyetracking: boolean;

  /**
   * If the target is allowed to access movement data.
   * @default false
   */
  @Column({ default: false })
  movement: boolean;

  @PrimaryColumn({ length: 255, type: 'varchar' })
  targetUserId: string;

  @PrimaryColumn({ length: 255, type: 'varchar' })
  subjectUserId: string;

  /**
   * The user that allows the permissions.
   * E.g. the patient.
   */
  @ManyToOne(
    type => User,
    user => user.permits,
    { onDelete: 'CASCADE' },
  )
  subject: User;

  /**
   * The user that is permitted by these permissions.
   * E.g. the therapist.
   */
  @ManyToOne(
    type => User,
    user => user.permittedBy,
    { onDelete: 'CASCADE' },
  )
  target: User;

  /**
   * Gets the description of the permissions.
   * @returns Description of permissions.
   */
  getDescription(): PermissionDescription {
    return {
      ecg: this.ecg,
      eda: this.eda,
      eyetracking: this.eyetracking,
      movement: this.movement,
      subjectId: this.subject.userId,
      targetId: this.target.userId,
    };
  }
}
