import { Component, OnInit } from '@angular/core';
import { Study } from '@sstepkiz';
import { StateService } from '../Services/state.service';

@Component({
  selector: 'app-study-overview',
  templateUrl: './study-overview.component.html',
  styleUrls: ['./study-overview.component.scss']
})
export class StudyOverviewComponent implements OnInit {
  listElements: Study[];

  constructor(private state: StateService) { }

  ngOnInit(): void {
    this.listElements = [];
  }

  setStudy(element: Study): void{
    // this.state.setCurrentStudy(element);
  }

}
