import { UserDescription } from '@sstepkiz';
import { IsAlphanumeric, MaxLength } from 'class-validator';

export class UserDescriptionDto implements UserDescription {
  /**
   * Identity of user.
   */
  @IsAlphanumeric()
  @MaxLength(255)
  userId: string;
}
