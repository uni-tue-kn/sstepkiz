import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthModule } from 'projects/auth/src/public-api';
import { SyncModule } from 'projects/sync/src/public-api';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { A11yModule } from '@angular/cdk/a11y';
import { environment } from 'projects/patient-ui/src/environments/environment';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FeedbackModule } from './feedback/feedback.module';
import { HeaderComponent } from './header/header.component';
import { MonitoringModule } from './monitoring/monitoring.module';
import { GameModule } from './game/game.module';
import { PatientSurveyModule } from './survey/survey.module';
import { SurveyLibModule } from 'projects/survey/src/public-api';
import { RtcModule } from 'projects/rtc/src/public-api';
import { DeviceType } from '@sstepkiz';
import { AuthModuleConfig } from 'projects/auth/src/lib/auth-module-config.class';
import { TestComponent } from './test/test.component';
import { ProgressComponent } from './progress/progress.component';
import { TitleComponent } from './title/title.component';
import { PreviewCardComponent } from './preview-card/preview-card.component';
import { StatisticComponent } from './statistic/statistic.component';
import { SensorComponent } from './sensor/sensor.component';
import { ImeraApiModule } from 'projects/imera-api/src/public-api';

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    DashboardComponent,
    HeaderComponent,
    TestComponent,
    ProgressComponent,
    TitleComponent,
    PreviewCardComponent,
    StatisticComponent,
    SensorComponent,
  ],
  imports: [
    ImeraApiModule.forRoot({
      imeraServerRootUrl: environment.urls.imeraApi
    }),
    AppRoutingModule,
    HttpClientModule,
    SurveyLibModule,
    AuthModule.forRoot(new AuthModuleConfig({
      authUrls: [
        environment.urls.signallingAdmin,
        environment.urls.imeraApi,
        environment.urls.gameApi,
      ],
      issuer: environment.urls.ssoServer,
      scope: 'openid profile email game',
      clientId: environment.clientId,
    })),
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    FeedbackModule,
    MonitoringModule,
    NgbTimepickerModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatSliderModule,
    A11yModule,
    RtcModule.forRoot({
      turnServers: environment.urls.turnServers,
      stunServers: environment.urls.stunServers,
      mode: DeviceType.Monitor,
      signallingServerUrl: environment.urls.signallingServer
    }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production
    }),
    PatientSurveyModule,
    GameModule,
    SyncModule,
    ReactiveFormsModule,
    FormsModule,
  ]
})
export class AppModule { }
