import { Component } from '@angular/core';
import { AuthService } from 'projects/auth/src/public-api';
import { SyncService } from 'projects/sync/src/public-api';

import { environment } from 'projects/patient-ui/src/environments/environment';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent {

  get username() {
    const claims = this.authService.claims;
    return claims === null ? 'unknown' : claims.name;
  }

  constructor(
    private readonly authService: AuthService,
    public readonly syncService: SyncService) {}
}
