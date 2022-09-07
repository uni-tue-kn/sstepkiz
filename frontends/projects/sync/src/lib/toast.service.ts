import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {

  /**
   * Array of shown toasts.
   */
  toasts: any[] = [];

  /**
   * Removes a toast.
   * @param toast Toast instance to remove.
   */
  remove(toast: any): void {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  /**
   * Creates a new toast to show.
   * @param header Header of toast.
   * @param body Body of toast.
   */
  show(header: string, body: string, classname: string = ''): void {
    this.toasts.push({ header, body, classname });
  }
}
