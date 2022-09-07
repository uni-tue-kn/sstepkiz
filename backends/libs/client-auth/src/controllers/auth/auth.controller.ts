import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
  UnauthorizedException,
  HttpStatus
} from '@nestjs/common';
import { Redirect, RedirectOptions } from '@nestjsplus/redirect';

import { AuthenticationResponseDto } from '../../dtos/authentication-response.dto';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '@nestjs/config';
import { AuthState } from '../../types/auth-state.enum';
import { AUTH_ENDPOINT } from '../../types/endpoints';

const FRONTEND_REDIRECTION_URL = `http://localhost:4000`;

@Controller(AUTH_ENDPOINT)
export class AuthController {

  private frontend_redirection_url: string;

  /**
   * Constructs a new Authentication Controller.
   * @param authService Auth Service instance.
   */
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {
    this.frontend_redirection_url = this.configService.get<string>('FRONTEND_REDIRECTION_URL', FRONTEND_REDIRECTION_URL);
  }

  /**
   * Receives the callback from the Authorization Server.
   * @param response Received callback query.
   * @returns Status message.
   */
  @Get()
  @Redirect()
  async callback(
    @Query() response: AuthenticationResponseDto,
  ): Promise<RedirectOptions> {
    if (this.authService.state !== AuthState.authenticating) {
      throw new UnauthorizedException('Callback not requested');
    }
    try {
      await this.authService.callback({ ...response });
    } catch (error) {
      console.error('Failed to compute received callback:', error);
      throw new InternalServerErrorException(
        'Authentication failed! Internal server error',
      );
    }
    return { statusCode: HttpStatus.FOUND, url: this.frontend_redirection_url };
  }
}
