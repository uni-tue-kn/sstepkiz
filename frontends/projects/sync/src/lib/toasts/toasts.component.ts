import { Component } from '@angular/core';

import { ToastService } from '../toast.service';

@Component({
  selector: 'lib-sync-toasts',
  styleUrls: ['./toasts.component.scss'],
  templateUrl: './toasts.component.html'
})
export class ToastsComponent {

  constructor(public readonly toastService: ToastService) {}
}
