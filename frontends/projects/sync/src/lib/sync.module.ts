import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { OfflineIndicatorComponent } from './offline-indicator/offline-indicator.component';
import { SyncService } from './sync.service';
import { ToastsComponent } from './toasts/toasts.component';
import { ToastService } from './toast.service';

@NgModule({
  declarations: [
    OfflineIndicatorComponent,
    ToastsComponent
  ],
  exports: [
    OfflineIndicatorComponent,
    ToastsComponent
  ],
  imports: [
    CommonModule,
    NgbModule
  ],
  providers: [
    SyncService,
    ToastService
  ]
})
export class SyncModule {}
