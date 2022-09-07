import { Component } from '@angular/core';

import { SyncService } from '../sync.service';

@Component({
  selector: 'lib-sync-offline-indicator',
  styleUrls: ['./offline-indicator.component.scss'],
  templateUrl: './offline-indicator.component.html'
})
export class OfflineIndicatorComponent {

  constructor(public readonly syncService: SyncService) {}
}
