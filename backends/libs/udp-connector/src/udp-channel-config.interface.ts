import { SocketType } from 'dgram';

export interface UdpChannelConfig {
  /**
   * Host name or IP address to listen for.
   */
  host: string;

  /**
   * IP version of socket.
   */
  ipType: SocketType;

  /**
   * Name of UDP channel.
   */
  name: string;

  /**
   * Port to listen on.
   */
  port: number;
}
