export enum PeerState {

  /**
   * Something failed.
   */
  error = -1,

  /**
   * No connection try yet.
   */
  none = 0,

  /**
   * Trying to connect.
   */
  connecting = 1,

  /**
   * Connected to remote peer.
   */
  connected = 2,

  /**
   * Connection is closed.
   */
  closed = 3
}
