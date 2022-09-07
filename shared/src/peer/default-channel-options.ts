export const DEFAULT_CHANNEL_OPTIONS: RTCDataChannelInit = {

  /**
   * Sets the maximum lifetime of a packet.
   */
  maxPacketLifeTime: 1000,

  /**
   * Sets if connection needs to be renegotiated.
   */
  negotiated: false,

  /**
   * Sets if packets need to arrive in same order as sent.
   */
  ordered: false,
};
