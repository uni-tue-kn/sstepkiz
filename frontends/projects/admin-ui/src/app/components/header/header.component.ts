import { Component } from '@angular/core';

import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent {

  /**
   * Gets, if user is authenticated.
   */
  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  /**
   * Title of the application.
   */
  readonly title = 'Admin UI';

  /**
   * Username of authenticated user.
   */
  get username(): string {
    return this.authService?.claims['preferred_username'] ?? '';
  }

  /**
   * Constructs a new header component.
   * @param authService Authentication Service.
   */
  constructor(
    private readonly authService: AuthService,
  ) { }

  /**
   * Performs login.
   */
  login(): void {
    this.authService.login();
  }

  /**
   * Performs logout.
   */
  logout(): void {
    this.authService.logout();
  }
}
