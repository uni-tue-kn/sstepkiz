import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RtcConfig } from '@sstepkiz';
import { AuthModule } from 'projects/auth/src/public-api';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NgxEchartsModule } from 'ngx-echarts';

import { PermissionComponent } from './components/permission/permission.component';
import { TestComponent } from './components/test/test.component';
import { RtcService } from './services/rtc.service';
import { ChannelComponent } from './components/channel/channel.component';
import { EyetrackingComponent } from './components/eyetracking/eyetracking.component';
import { UserUiComponent } from './components/user-ui/user-ui.component';
import { BodyFunctionsEcgComponent } from './components/body-functions-ecg/body-functions-ecg.component';
import { BodyFunctionsEdaComponent } from './components/body-functions-eda/body-functions-eda.component';
import { IceApiService } from './services/ice-api.service';
import { SensorPageComponent } from './components/sensor-page/sensor-page.component';
import { PiechartComponent } from './components/piechart/piechart.component';

@NgModule({
  declarations: [
    ChannelComponent,
    EyetrackingComponent,
    PermissionComponent,
    TestComponent,
    UserUiComponent,
    BodyFunctionsEcgComponent,
    BodyFunctionsEdaComponent,
    SensorPageComponent,
    PiechartComponent
  ],
  exports: [
    TestComponent, 
    EyetrackingComponent, 
    BodyFunctionsEcgComponent, 
    BodyFunctionsEdaComponent, 
    UserUiComponent, 
    ChannelComponent,
    SensorPageComponent
  ],
  imports: [
    AuthModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatTooltipModule,
    MatInputModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'), // or import('./path-to-my-custom-echarts')
    }),
  ],
  providers: [
    IceApiService,
    RtcService
  ]
})
export class RtcModule {
  static forRoot(config: RtcConfig): ModuleWithProviders<RtcModule> {
    return {
      ngModule: RtcModule,
      providers: [
        { provide: RtcConfig, useValue: config }
      ]
    };
  }
}
