import { ChannelType } from "./channel-type.enum";
import { TxChannel } from "./tx-channel.class";

export interface ChannelRequestEvent {

  /**
   * Accepts and opens the channel.
   * @returns The sender channel.
   */
  accept(): TxChannel;

  /**
   * Type of requested channel.
   */
  type: ChannelType;
}
