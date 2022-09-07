import { Component, OnInit } from '@angular/core';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent implements OnInit {

  /**
   * Navigates to login page.
   */
  private gotoBackendLogin() {
    document.location.href = `${environment.urls.aggregatorBackend}/login`;
  }

  /**
   * Initializes the component.
   */
  async ngOnInit() {
    // First login at the aggregator server.
    this.gotoBackendLogin();
  }
}
