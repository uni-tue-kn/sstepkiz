import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TestComponent } from './test/test.component';
import { PageNotFoundComponent } from './page/page-not-found/page-not-found.component';
import { StudyComponent } from './study/study.component';
import { ContextOverviewComponent } from './survey/context-overview/context-overview.component';
import { ContextNewComponent } from './survey/context-new/context-new.component';
import { ContextComponent } from './survey/context/context.component';
import { PatientsComponent } from './patient/patients/patients.component';
import { PatientsOverviewComponent } from './patient/patients-overview/patients-overview.component';
import { InstrumentComponent } from './survey/instrument/instrument.component';
import { FeedbackComponent } from './patient/feedback/feedback.component';
import { IntermediatePageComponent } from './survey/context-new/intermediate-page/intermediate-page.component';
import { SensorComponent } from './patient/sensor/sensor.component';
import { ContextScheduleComponent } from './survey/context-schedule/context-schedule.component';
import { TimeComponent } from './patient/time/time.component';
import { ResultsComponent } from './patient/results/results.component';
import { ResultsOverviewComponent } from './patient/results-overview/results-overview.component';
import { ChartComponent } from './patient/results/chart/chart.component';
import { PreviewComponent } from './survey/preview/preview.component';
import {TimePickerComponent} from "./survey/time-picker/time-picker.component";

const routes: Routes = [
  { component: ChartComponent, path: 'chart' },
  { component: TestComponent, path: 'test' },
  { component: InstrumentComponent, path: 'studie/befragung/instrument' },
  { component: IntermediatePageComponent, path: 'studie/neue-befragung/instrument' },
  { component: PatientsComponent, path: 'studie/patienten/patient' },
  { component: ResultsOverviewComponent, path: 'studie/patienten/patient/ergebnisseueberblick' },
  { component: ResultsComponent, path: 'studie/patienten/patient/ergebnisse' },
  { component: PatientsOverviewComponent, path: 'studie/patienten' },
  { component: ContextOverviewComponent, path: 'studie/befragungen' },
  { component: ContextNewComponent, path: 'studie/neue-befragung' },
  { component: ContextComponent, path: 'studie/befragung' },
  { component: PreviewComponent, path: 'studie/befragung/preview' },
  { component: StudyComponent, path: '' },
  { component: ContextScheduleComponent, path: 'studie/befragung/zeitplan' },
  { component: TimePickerComponent, path: 'studie/befragung/zeitplan-erstellen' },
  { component: SensorComponent, path: 'sensor' },
  { component: TimeComponent, path: 'time' },
  { component: FeedbackComponent, path: 'studie/patienten/patient/feedback' },
  { component: PageNotFoundComponent, path: '**' },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes)]
})
export class AppRoutingModule { }
