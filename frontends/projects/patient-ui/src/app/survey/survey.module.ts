import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { SurveyDashboardComponent } from './survey-dashboard/survey-dashboard.component';
import { SurveyPreviewComponent } from './survey-preview/survey-preview.component';
import { SurveyPageComponent } from './survey-page/survey-page.component';
import { SurveyLibModule } from 'projects/survey/src/public-api';
import { AppRoutingModule } from '../app-routing.module';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";


@NgModule({
  declarations: [SurveyDashboardComponent, SurveyPreviewComponent, SurveyPageComponent,

  ],
    imports: [CommonModule, NgbModule, ReactiveFormsModule, MatCheckboxModule,
        MatSliderModule, FormsModule, AppRoutingModule, SurveyLibModule, MatProgressSpinnerModule]
})
export class PatientSurveyModule { }
