import { Injectable } from '@angular/core';
import { ComplaintDegree, ComplaintItem } from '@sstepkiz';
import { SyncService } from 'projects/sync/src/public-api';

import { environment } from 'projects/patient-ui/src/environments/environment';

//const COMPLAINT_UPLOAD_URI = environment.urls.imeraApi + '/feedback';

@Injectable({ providedIn: 'root' })
export class FeedbackService {

  constructor(private readonly syncService: SyncService) {}

  /**
   * Sends a new complaint using sync service.
   * @param degree Degree of complaint.
   * @param date Date and time of recording.
   */
  //async sendComplaint(degree: ComplaintDegree, time: Date = new Date()): Promise<void> {
   // const body: ComplaintItem = { degree, time: time.toISOString() };
   // await this.syncService.enqueue(COMPLAINT_UPLOAD_URI, body, 'Feedback');
  //}
}
