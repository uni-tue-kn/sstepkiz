export interface UserState {

  /**
   * Indicates if user is online.
   */
  available: boolean;

  /**
   * Identity of socket.
   */
  socketId: string;

  /**
   * Identity of user.
   */
  userId: string;
}
