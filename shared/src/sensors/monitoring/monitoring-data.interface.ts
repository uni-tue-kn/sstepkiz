import { ChannelType } from "../../peer/channel-type.enum";

export interface MonitoringData {

  /**
   * Indicates, if connection is active or not.
   * @example true = active.
   * @example false = inactive.
   */
  active: boolean;

  /**
   * Type of channel.
   */
  type: ChannelType;

  /**
   * Identity of user that is connected.
   */
  userId: string;
}
