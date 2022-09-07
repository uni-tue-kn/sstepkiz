import { IsUUID } from 'class-validator';

export class IdParameterDto {
  /**
   * Identity.
   */
  @IsUUID('4')
  id: string;
}
