import { AuthType } from "./auth-type.enum";

export interface ConnectionResponse {

  /**
   * Supported authentication types.
   */
  authTypes: AuthType[];
}
