import { Component, OnInit } from '@angular/core';
import { StateService } from '../../Services/state.service';
import { ImeraApiService } from 'projects/imera-api/src/public-api';
import { User } from '@sstepkiz';

@Component({
  selector: 'app-patients-overview',
  templateUrl: './patients-overview.component.html',
  styleUrls: ['./patients-overview.component.scss']
})
export class PatientsOverviewComponent implements OnInit {
  routerLink = 'patient';
  routerLinkBack = '';
  listElements: User[] = [];
  text = 'Hier sind alle Patienten der SSTeP-KiZ Studie';

  constructor(private state: StateService, private imeraApiService: ImeraApiService) { }

  ngOnInit(): void {
    this.listElements = this.imeraApiService.getUsers();
    

  }

  setPatient(element: User): void {
    this.state.setCurrentUser(element);
  }

}
