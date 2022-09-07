import { RegistrationRequest } from '@sstepkiz';
import { IsJWT } from 'class-validator';

export class RegistrationRequestDto implements RegistrationRequest {
  /**
   * OAuth Access Token.
   */
  @IsJWT()
  accessToken: string;
}
