import { PermissionDescription } from '@sstepkiz';
import {
  IsBoolean,
  IsAlphanumeric,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class PermissionDescriptionDto implements PermissionDescription {
  /**
   * If the target ist allowed to access ECG data.
   */
  @IsBoolean()
  @IsOptional()
  ecg?: boolean;

  /**
   * If the target is allowed to access EDA data.
   */
  @IsBoolean()
  @IsOptional()
  eda?: boolean;

  /**
   * If the target is allowed to access eyetracking data.
   */
  @IsBoolean()
  @IsOptional()
  eyetracking?: boolean;

  /**
   * If the target is allowed to access movement data.
   */
  @IsBoolean()
  @IsOptional()
  movement?: boolean;

  /**
   * Identity of the user that allows the permissions.
   */
  @IsAlphanumeric()
  @MaxLength(255)
  subjectId: string;

  /**
   * Identity of user that is permitted by these permissions.
   */
  @IsAlphanumeric()
  @MaxLength(255)
  targetId: string;
}
