import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ServiceWorkerModule } from "@angular/service-worker";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { DeviceType } from "@sstepkiz";
import { AuthModule, AuthModuleConfig } from "projects/auth/src/public-api";
import { RtcModule } from "projects/rtc/src/public-api";
import { PatientModule } from "../app/patient/patient.module";
import { SurveyModule } from "./survey/survey.module";

import { environment } from "projects/therapist-ui/src/environments/environment";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { TestComponent } from "./test/test.component";
import { StudyComponent } from "./study/study.component";
import { StudyOverviewComponent } from "./study-overview/study-overview.component";
import { StateService } from "./Services/state.service";
import { HttpClientModule } from "@angular/common/http";
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { PageModule } from "./page/page.module";
import { ImeraApiModule } from "projects/imera-api/src/public-api";
import { SurveyLibModule } from "projects/survey/src/public-api";
import { HotToastModule } from "@ngneat/hot-toast";

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent, TestComponent, StudyComponent, StudyOverviewComponent],
  imports: [
    ImeraApiModule.forRoot({
      imeraServerRootUrl: environment.urls.imeraApi,
    }),
    AppRoutingModule,
    HttpClientModule,
    AuthModule.forRoot(
      new AuthModuleConfig({
        authUrls: [environment.urls.signallingAdmin, environment.urls.imeraApi],
        issuer: environment.urls.ssoServer,
        scope: "signalling_receive",
        clientId: environment.clientId,
      })
    ),
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    NgbModule,
    PatientModule,
    PageModule,
    RtcModule.forRoot({
      stunServers: environment.urls.stunServers,
      turnServers: environment.urls.turnServers,
      mode: DeviceType.Receiver,
      signallingServerUrl: environment.urls.signallingServer,
    }),
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production,
    }),
    SurveyModule,
    SurveyLibModule,
    HotToastModule.forRoot({
      duration: 3000,
    }),
  ],
  providers: [
    StateService,
    { provide: MAT_DATE_LOCALE, useValue: "de-ch" },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class AppModule {}
