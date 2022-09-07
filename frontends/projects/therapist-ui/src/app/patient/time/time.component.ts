import { Component } from '@angular/core';
import { ImeraApiService } from 'projects/imera-api/src/public-api';
import { Result } from '@sstepkiz';
import { StateService } from '../../Services/state.service';

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.scss']
})
export class TimeComponent {

  backLink = '/studie/patienten/patient';
  listElements: { start?: string, end?: string }[] = [];

  constructor(private imeraApiService: ImeraApiService, private state: StateService) {

    this.imeraApiService.getResult(String(this.state.currentUser.id)).then(
      data => {
        let result: Result[] = [];
        data.forEach(element => {
          if (element.context.id == this.imeraApiService.TIME_ID) {
            result.push(element);
          }
        });

        /**
         * Sorts beginning and end together
         */
        for (let index = 0; index < result.length; index++) {
          if (result[index].resultPoints[0].observation.id == imeraApiService.TIME_OBSERVATION_IDS[0]) {
            this.listElements.push({ start: result[index].created })
          }
          else if (result[index].resultPoints[0].observation.id == imeraApiService.TIME_OBSERVATION_IDS[1]) {
            if (index - 1 >= 0) {
              if (result[index - 1].resultPoints[0].observation.id == imeraApiService.TIME_OBSERVATION_IDS[0]) {
                this.listElements[this.listElements.length - 1].end = result[index].created;
              }
            }
            else {
              this.listElements.push({ end: result[index].created });
            }
          }

        }
      }


    );
  }

  

}
