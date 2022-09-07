import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ImeraApiService } from 'projects/imera-api/src/public-api';
import { Instrument, ResultPoint } from '@sstepkiz';
import { ExtendObservations } from '@sstepkiz';
import { Router } from '@angular/router';

import { StateService } from '../../Services/state.service';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnDestroy {

  subscriptions: Subscription[] = [];
  routerLinkBack: string = "/studie/befragung";
  
  instruments: Instrument[];
  observations: ExtendObservations[];
  title: string;
  text: string = 'Hier sehen Sie die Vorrschau auf den Fragenbogen: ';

  coins: number = 30;

  constructor(private imeraApiService: ImeraApiService, private state: StateService, private readonly router: Router) {

    this.subscriptions.push(this.imeraApiService.getObservationsByContextId(this.state.currentContextId).subscribe(
      data => {
        this.subscriptions.push(this.imeraApiService.extendObservations(data).subscribe(
          data => {
            if(data != undefined){
            this.observations = data;
            this.title = this.observations[0].context.name;
            this.text += this.title;
            this.instruments = this.imeraApiService.getInstruments(this.observations);
            }
          }
        ));
      }
    ));
  }

  /**
   * Closes the preview.
   */
  exit(resultPoints: ResultPoint[]): void {
    this.router.navigate([this.routerLinkBack]);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
