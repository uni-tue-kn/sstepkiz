import { Component, OnInit } from '@angular/core';
import { User } from '@sstepkiz';

import { StateService } from '../../Services/state.service';

@Component({
  selector: 'app-sensor',
  styleUrls: ['./sensor.component.scss'],
  templateUrl: './sensor.component.html',
})
export class SensorComponent implements OnInit {

  routerLinkBack = '/studie/patienten/patient';

  user?: User;

  constructor(public readonly state: StateService) { }

  ngOnInit(): void {
    this.user = this.state.currentUser;
  }
}
