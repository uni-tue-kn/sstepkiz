import { Component } from '@angular/core';
import { Result, ResultPoint } from '@sstepkiz';

import { ImeraApiService } from '../../../../imera-api/src/public-api'
import { UserInformationService } from '../services/user-information.service';

@Component({
  selector: 'app-sensor',
  styleUrls: ['./sensor.component.scss'],
  templateUrl: './sensor.component.html',
})
export class SensorComponent {

  observationIdEnd: number = this.imeraApiService.TIME_OBSERVATION_IDS[1];

  // If the Context id or observationsids changes, it must be adjusted here.
  observationIdStart: number = this.imeraApiService.TIME_OBSERVATION_IDS[0];

  time: Date;

  _exposition: string;
  get exposition(): string {
    return this._exposition;
  }
  set exposition(value: string) {
    if (value === this._exposition) return;
    this._exposition = value;
    this.send(value);
  }

  constructor(
    public userInfo: UserInformationService,
    private imeraApiService: ImeraApiService,
  ) {}

  /**
    * sends which of the three buttons Start, Kognitive Intervention, End was pressed to the Observation time marker
    */
   send(buttonText: string): void {
    let result: Result = new Result(
      { id:  this.userInfo.user.id},
      { id: this.imeraApiService.TIME_MARKER_CONTEXT_ID },
      [{ observation: {
          id: this.imeraApiService.TIME_MARKER_OBSERVATION_ID
        },
        textValue: buttonText
      }]);
    this.imeraApiService.postNewResult(result)
      .catch(error => console.error(error));
  }

  /**
   * Creates and sends the start or end time.
   */
  sessionTimeStartEnd(): void {
    this.time = new Date();
    let id;

    if (!this.userInfo.startedExersice) {
      id = this.observationIdStart;
      this.exposition = 'pause';
    } else {
      id = this.observationIdEnd;
      this.exposition = 'end';
    }

    let resultBegin: ResultPoint = {
      observation: {
        id
      },
      dateValue: this.time,
    };

    let timeResult: Result = new Result(
      { id: this.userInfo.user.id },
      {
        id: this.imeraApiService.TIME_ID,
        contextType: { id: 1, name: 'Fragebogen' }
      },
      [resultBegin]
    );
    // this.timeResult.resultPoints = [resultBegin];
    this.imeraApiService.postNewResult(timeResult)
      .then(data => { console.log(data); })
      .catch(error => console.error(error));

    this.userInfo.startExersice(!this.userInfo.startedExersice)
  }
}
