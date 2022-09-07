import { CallAnswer } from '@sstepkiz';
import { IsBoolean, IsUUID } from 'class-validator';

export class CallAnswerDto implements CallAnswer {
  /**
   * Indicates if user accepted the call.
   */
  @IsBoolean()
  accepted: boolean;

  /**
   * Indicates if user accepted the call.
   */
  @IsUUID(4)
  sessionId: string;
}
