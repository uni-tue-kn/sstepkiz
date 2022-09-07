import { Component } from '@angular/core';
import { Result } from '@sstepkiz';
import { ImeraApiService } from 'projects/imera-api/src/public-api';

import { StateService } from '../../Services/state.service';

@Component({
  selector: 'app-feedback',
  styleUrls: ['./feedback.component.scss'],
  templateUrl: './feedback.component.html',
})
export class FeedbackComponent {
  backLink = '/studie/patienten/patient';
  listElements: Result[] = [];

  constructor(private imeraApiService: ImeraApiService, private state: StateService) {
    this.imeraApiService.getResult(String(this.state.currentUser.id)).then(
      data => {
        data.forEach(element => {
          if (element.context.id == this.imeraApiService.FEEDBACK_ID){
            this.listElements.push(element);
          }
        });        
      }
    );
  }
}
