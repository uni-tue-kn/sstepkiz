export interface UserDescription {

  /**
   * Type of user.
   */
  group?: UserGroups;

  /**
   * SSO-internal user ID.
   */
  id?: number;

  /**
   * Password of user.
   */
  password?: string;

  /**
   * Mapping of target user's username to its permissions.
   */
  permissions?: {
    [targetUsername: string]: {
      ecg?: boolean,
      eda?: boolean,
      etk?: boolean,
      mov?: boolean,
    },
  };

  /**
   * User's public UUID.
   */
  userId?: string;

  /**
   * Username used for login.
   */
  username: string;
}

export type UserGroups = 'patient' | 'therapist' | 'admin';
