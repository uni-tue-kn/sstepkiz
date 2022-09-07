import { CandidateOffer } from '@sstepkiz';
import {
  IsAscii,
  IsObject,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CandidateOfferDto implements CandidateOffer {
  /**
   * ICE candidate.
   */
  @IsObject()
  candidate: RTCIceCandidateInit;

  /**
   * Identity of session.
   */
  @IsUUID(4)
  sessionId: string;

  /**
   * Identity of socket that sent the candidate.
   */
  @IsAscii()
  @MaxLength(20)
  @MinLength(20)
  socketId: string;
}
