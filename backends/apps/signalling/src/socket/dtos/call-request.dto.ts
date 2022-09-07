import { CallRequest, DeviceType } from '../../../../../../shared/dist';
import { IsAscii, IsEnum, MaxLength, MinLength } from 'class-validator';

export class CallRequestDto implements CallRequest {
  /**
   * Mode of connection.
   */
  @IsEnum(DeviceType)
  mode: DeviceType.Monitor | DeviceType.Receiver;

  /**
   * Identity of socket.
   */
  @IsAscii()
  @MaxLength(20)
  @MinLength(20)
  socketId: string;
}
