import { ChannelRequest, ChannelType } from '../../../../../../shared/dist';
import { IsAscii, IsEnum, IsUUID, MaxLength, MinLength } from 'class-validator';

export class ChannelRequestDto implements ChannelRequest {
  /**
   * Identity of session.
   */
  @IsUUID(4)
  sessionId: string;

  /**
   * Identity of a socket.
   * In case of Peer -> Signalling Server: Socket ID of target.
   * In case of Signalling Server -> Peer: Socket ID of source.
   */
  @IsAscii()
  @MaxLength(20)
  @MinLength(20)
  socketId: string;

  /**
   * Types of requested channels.
   */
  @IsEnum(ChannelType, { each: true })
  types: ChannelType[];
}
