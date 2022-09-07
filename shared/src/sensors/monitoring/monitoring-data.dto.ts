import { IsAlphanumeric, IsBoolean, IsEnum, IsString } from "class-validator";

import { ChannelType } from "../../peer/channel-type.enum";
import { MonitoringData } from "./monitoring-data.interface";

export class MonitoringDataDto implements MonitoringData {

  /**
   * Indicates, if connection is active or not.
   * @example true = active.
   * @example false = inactive.
   */
  @IsBoolean()
  active = false;

  /**
   * Type of channel.
   */
  @IsEnum(ChannelType)
  type: ChannelType = ChannelType.monitoring;

  /**
   * Identity of user that is connected.
   */
  @IsString()
  @IsAlphanumeric()
  userId = '';
}
