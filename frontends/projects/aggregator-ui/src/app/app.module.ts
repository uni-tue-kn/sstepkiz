import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxEchartsModule } from 'ngx-echarts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { ComMessageDialogComponent } from './components/com-message-dialog/com-message-dialog.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LockComponent } from './components/lock/lock.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { LookComponent } from './components/look/look.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SensorTileComponent } from './components/sensor-tile/sensor-tile.component';
import { UnlockButtonComponent } from './components/unlock-button/unlock-button.component';
import { YesNoDialogComponent } from './components/yes-no-dialog/yes-no-dialog.component';
import { CustomSensorComponentDirective } from './interfaces/custom-sensor-component.directive';

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    ComMessageDialogComponent,
    CustomSensorComponentDirective,
    DashboardComponent,
    LockComponent,
    LoginPageComponent,
    LookComponent,
    PageNotFoundComponent,
    SensorTileComponent,
    UnlockButtonComponent,
    YesNoDialogComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    DragDropModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatTooltipModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
  ],
})
export class AppModule {}
