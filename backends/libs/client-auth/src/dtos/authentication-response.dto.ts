import { IsString } from 'class-validator';

export class AuthenticationResponseDto {
  /**
   * Code for PKCE challenge.
   */
  @IsString()
  code: string;

  /**
   * Session state.
   */
  @IsString()
  session_state: string;
}
