export enum SignallingChannelState {

  /**
   * Connection failed.
   */
  error = -1,

  /**
   * Not connected.
   */
  none = 0,

  /**
   * Establishing connection to connect to server.
   */
  connecting = 1,

  /**
   * Connected, but not yet registered.
   */
  connected = 2,

  /**
   * Connected and trying to authenticate.
   */
  registering = 3,

  /**
   * Connected and registered.
   */
  registered = 4
}
