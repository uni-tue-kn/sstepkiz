import { DescriptionOffer } from '@sstepkiz';
import {
  IsAscii,
  IsObject,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class DescriptionOfferDto implements DescriptionOffer {
  /**
   * RTC session description.
   */
  @IsObject()
  description: RTCSessionDescriptionInit;

  /**
   * Identity of session.
   */
  @IsUUID(4)
  sessionId: string;

  /**
   * Identity of socket that sent the description.
   */
  @IsAscii()
  @MaxLength(20)
  @MinLength(20)
  socketId: string;
}
