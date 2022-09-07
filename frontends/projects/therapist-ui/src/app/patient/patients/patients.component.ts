import { Component} from '@angular/core';
import { StateService } from '../../Services/state.service';


@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss']
})
export class PatientsComponent{

  backLink = '/studie/patienten';

  /**
   * These elements are displayed on the page as a menu.
   */
  navElements = [
    { title: 'Feedback einsehen', link: '/studie/patienten/patient/feedback', image: '../../assets/feedback.svg'},
    { title: 'Sensoren', link: '/sensor', image: '../../assets/sensor.svg'},
    { title: 'Ergebnisse', link: '/studie/patienten/patient/ergebnisseueberblick', image: '../../assets/data.svg'},
    { title: 'Zeiten', link: '/time', image: '../../assets/time.svg'}
  ];

  constructor(public readonly state: StateService) {}
}

