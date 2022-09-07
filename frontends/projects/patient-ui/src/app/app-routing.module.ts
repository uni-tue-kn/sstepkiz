import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { FeedbackDashboardComponent } from './feedback/feedback-dashboard/feedback-dashboard.component';
import { GameMapComponent } from './game/game-map/game-map.component';
import { GameWardorbeComponent } from './game/game-wardorbe/game-wardorbe.component';
import { MonitoringDashboardComponent } from './monitoring/monitoring-dashboard/monitoring-dashboard.component';
import { ProgressComponent } from './progress/progress.component';
import { SensorComponent } from './sensor/sensor.component';
import { SurveyDashboardComponent } from './survey/survey-dashboard/survey-dashboard.component';
import { SurveyPageComponent } from './survey/survey-page/survey-page.component';
import { TestComponent } from './test/test.component';
import { TitleComponent } from './title/title.component';

const routes: Routes = [
  { component: DashboardComponent, path: '', children: [
    { component: SurveyDashboardComponent, path: '' },
    { component: FeedbackDashboardComponent, path: 'feedback' },
    { component: MonitoringDashboardComponent, path: 'monitoring' },
    { component: ProgressComponent, path: 'progress' },
    { component: SensorComponent, path: 'sensor' },
    { component: TitleComponent, path: 'title' },
  ]},
  { component: GameWardorbeComponent, path: 'avatar' },
  { component: GameMapComponent, path: 'map/:index' },
  { component: SurveyPageComponent, path: 'surveypage/:id' },
  { component: TestComponent, path: 'test' },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes)],
})
export class AppRoutingModule { }
