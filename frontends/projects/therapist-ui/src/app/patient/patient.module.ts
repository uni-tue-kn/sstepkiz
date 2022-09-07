import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../app-routing.module';
import { FeedbackComponent } from './feedback/feedback.component';
import { PatientsComponent } from './patients/patients.component';
import { PatientsOverviewComponent } from './patients-overview/patients-overview.component';
import { SensorComponent } from './sensor/sensor.component';
import { RtcModule } from 'projects/rtc/src/public-api';
import { PageModule } from '../page/page.module';
import { ResultsComponent } from './results/results.component';
import { TimeComponent } from './time/time.component';
import { ResultsOverviewComponent } from './results-overview/results-overview.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { OwnResultComponent } from './results/own-result/own-result.component';
import { ChartComponent } from './results/chart/chart.component';
import { ChartsModule } from 'ng2-charts';


@NgModule({
  declarations: [
    FeedbackComponent,
    PatientsComponent,
    PatientsOverviewComponent,
    SensorComponent,
    ResultsComponent,
    TimeComponent,
    ResultsOverviewComponent,
    OwnResultComponent,
    ChartComponent
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    RtcModule,
    PageModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDatepickerModule,
    MatMomentDateModule,
    ChartsModule,
  ]
})
export class PatientModule { }


