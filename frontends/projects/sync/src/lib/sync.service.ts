import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';

import { ToastService } from './toast.service';
import { UploadTask } from './upload-task';

const PENDING_UPLOAD_TASKS_STORAGE_KEY = 'pendingUploads';

@Injectable({ providedIn: 'root' })
export class SyncService implements OnDestroy {

  /**
   * Gets the pending upload tasks reading them from the persistant local storage.
   */
  private get pendingUploadTasks(): UploadTask[] {
    const item = localStorage.getItem(PENDING_UPLOAD_TASKS_STORAGE_KEY);

    if (item === null) {
      this.pendingUploadTasks = [];
      return [];
    } else {
      return JSON.parse(item);
    }
  }
  /**
   * Sets the the pending upload tasks writing them to the persistant local storage.
   */
  private set pendingUploadTasks(value: UploadTask[]) {
    const json = JSON.stringify(value);
    localStorage.setItem(PENDING_UPLOAD_TASKS_STORAGE_KEY, json);
  }

  /**
   * Gets if app is online.
   */
  get online(): boolean {
    return navigator.onLine;
  }

  constructor(private readonly http: HttpClient, private readonly toastService: ToastService) {
    this.subscribeOnlineActivity();
    this.sync();
  }

  /**
   * Clears the list of pending tasks.
   */
  clear(): void {
    this.pendingUploadTasks = [];
  }

  /**
   * Enqueues a task to upload information.
   * @param url URL to upload information to.
   * @param body Body of upload containing information.
   * @param name Name of upload task, used in toast.
   */
  async enqueue(url: string, body: any, name: string): Promise<void> {
    // Start synchronization in background just in case, without waiting for it.
    this.sync();

    // Create new upload task item.
    const task: UploadTask = { url, body, name };

    // Enqueue, in case of any failure like closing browser before upload.
    this.pendingUploadTasks = this.pendingUploadTasks.concat(task);

    if (this.online) {
      // Await Upload, if online.
      try {
        await this.upload(task);
      } catch { }
    } else {
      this.toastService.show('SyncService', `${name} wird gesendet, sobald die Verbindung wiederhergestellt ist.`, 'bg-warning text-light');
    }
  }

  /**
   * Cleans up the service before it gets destroyed.
   */
  ngOnDestroy(): void {
    this.unsubscribeOnlineActivity();
  }

  /**
   * Informs about offline state in console.
   * This is important to force update of UI.
   */
  private onOffline = async () => {
    // console.info('[SyncService]: App is now offline!');
  }

  /**
   * Uploads the pending upload tasks when connection is established again.
   */
  private onOnline = async () => {
    // console.info('[SyncService]: App is now online!');
    this.sync();
  }

  /**
   * Starts listening to online state change.
   */
  private subscribeOnlineActivity() {
    window.addEventListener('offline', this.onOffline);
    window.addEventListener('online', this.onOnline);
  }

  /**
   * Starts synchronization.
   */
  async sync(): Promise<void> {
    const tasks = this.pendingUploadTasks;
    for (const t of tasks) {
      if (!this.online) {
        break;
      }

      try {
        await this.upload(t);
      } catch {
        continue;
      }
    }
  }

  /**
   * Stops listening to online state change.
   */
  private unsubscribeOnlineActivity() {
    window.removeEventListener('offline', this.onOffline);
    window.removeEventListener('online', this.onOnline);
  }

  /**
   * Uploads information to the server.
   * @param task Task to upload.
   */
  private async upload(task: UploadTask): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post(task.url, task.body).toPromise().then(() => {
        // Remove task from upload queue.
        this.pendingUploadTasks = this.pendingUploadTasks.filter(x => x === task);

        // Show toast notification.
        this.toastService.show('SyncService', task.name + ' wurde erfolgreich gesendet.', 'bg-success text-light');
        resolve();
      }).catch((error: HttpErrorResponse) => {
        // Add task to queue, if uploading failed due to an unknown (connection) error.
        if (error.status === 0) {
          this.pendingUploadTasks = this.pendingUploadTasks.concat(task);
          return;
        }

        console.error('[SyncService]: Upload failed!', error);
        this.toastService.show('SyncService', task.name + ' konnte nicht gesendet werden.', 'bg-danger text-light');
        reject(error);
      }).finally(() => {
      });
    });
  }
}
