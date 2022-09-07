export interface PermissionDescription {

  /**
   * If the target is allowed to access ECG data.
   * @default false
   */
  ecg?: boolean;

  /**
   * If the target is allowed to access EDA data.
   * @default false
   */
  eda?: boolean;

  /**
   * If the target is allowed to access eyetracking data.
   * @default false
   */
  eyetracking?: boolean;

  /**
   * If the target is allowed to access movement data.
   * @default false
   */
  movement?: boolean;

  /**
   * Identity of the user that allows the permissions.
   */
  subjectId: string;

  /**
   * Identity of user that is permitted by these permissions.
   */
  targetId: string;
}
