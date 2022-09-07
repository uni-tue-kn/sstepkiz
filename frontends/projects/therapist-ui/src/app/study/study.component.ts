import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Study } from '@sstepkiz';
import { StateService } from '../Services/state.service';

@Component({
  selector: 'app-study',
  templateUrl: './study.component.html',
  styleUrls: ['./study.component.scss']
})
export class StudyComponent implements OnInit {
  study: Study;
  studyId: number;
  navElements = [
    {title: 'Befragungen', link: 'studie/befragungen', image: '../../assets/context.svg', cradit: 'Survey by Vectors Point from the Noun Project'},
    {title: 'Patienten', link: 'studie/patienten', image: '../../assets/group.svg', cradit: 'group by Alice Design from the Noun Project'}
  ];

  constructor( private route: ActivatedRoute, private state: StateService) { }

  ngOnInit(): void {
   this.study = this.state.STUDY;
    // this.study = this.state.getStudy();

}

}
