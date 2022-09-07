import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { OAuthModule } from 'angular-oauth2-oidc';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { CreateUserDialogComponent } from './components/create-user-dialog/create-user-dialog.component';
import { HeaderComponent } from './components/header/header.component';
import { PermissionsComponent } from './components/permissions/permissions.component';
import { ResetPasswordDialogComponent } from './components/reset-password-dialog/reset-password-dialog.component';
import { UsersComponent } from './components/users/users.component';
import { YesNoDialogComponent } from './components/yes-no-dialog/yes-no-dialog.component';
import { HotToastModule } from '@ngneat/hot-toast';

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    CreateUserDialogComponent,
    HeaderComponent,
    PermissionsComponent,
    ResetPasswordDialogComponent,
    UsersComponent,
    YesNoDialogComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    CdkTableModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule,
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: [
          environment.urls.signallingAdmin,
          environment.urls.gameApi,
          environment.urls.imeraBackend,
        ],
        sendAccessToken: true,
      },
    }),
    ReactiveFormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
    HotToastModule.forRoot(),
  ],
  providers: [],
})
export class AppModule { }
