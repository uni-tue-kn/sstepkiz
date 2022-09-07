import { Component } from '@angular/core';
import { AuthService } from 'projects/auth/src/public-api';

@Component({
  selector: 'app-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html'
})
export class HeaderComponent {

  isMenuCollapsed = true;

  onEye = false;

  onInstructions = false;

  /**
   * Title of the application.
   */
  readonly title: string = 'SSteP-KiZ Patient UI';

  constructor(
    public readonly authService: AuthService,
  ) {}

  logout(){
    this.authService.logout();
    sessionStorage.clear();
  }

  toggleInstructions(): void {
    this.onInstructions = !this.onInstructions;
  }
}
