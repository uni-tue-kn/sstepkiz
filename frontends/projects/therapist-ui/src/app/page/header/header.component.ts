import { Component } from '@angular/core';
import { AuthService } from 'projects/auth/src/public-api';

@Component({
  selector: 'app-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html'
})
export class HeaderComponent {

  /**
   * Title of the application.
   */
  title = 'Therapist UI';

  constructor(public readonly authService: AuthService) {}
}
