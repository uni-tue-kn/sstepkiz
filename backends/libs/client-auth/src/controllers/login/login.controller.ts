import { Controller, Get, Redirect } from '@nestjs/common';
import { AuthService } from '@libs/client-auth/services/auth.service';
import { AuthState } from '@libs/client-auth/types/auth-state.enum';

@Controller('login')
export class LoginController {
  /**
   * Constructs a new Login Controller.
   * @param authService Auth Service instance.
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * Redirects to the login page of the SSO.
   * @returns Redirect URL.
   */
  @Get()
  @Redirect('', 302)
  async login(): Promise<{ url: string }> {
    const url = await this.authService.getLoginUrl();
    return { url };
  }

  /**
   * Returns if the user is logged in or not
   * @returns Boolean if the user is logged in
   */
   @Get('status')
   async getLoginStatus(): Promise<{ loggedIn: boolean }> {
     const loggedIn = (this.authService.state === AuthState.authenticated);
     return { loggedIn: loggedIn };
   }
}
