import { DeviceType } from '../../../../../../shared/dist';
import { IsEnum } from 'class-validator';

export class ConnectionRequestDto {
  /**
   * Device type to register as.
   */
  @IsEnum(DeviceType)
  mode: DeviceType;
}
