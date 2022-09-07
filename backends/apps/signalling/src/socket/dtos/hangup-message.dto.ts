import { HangupMessage } from '@sstepkiz';
import { IsUUID } from 'class-validator';

export class HangupMessageDto implements HangupMessage {
  /**
   * Identity of session.
   */
  @IsUUID(4)
  sessionId: string;
}
