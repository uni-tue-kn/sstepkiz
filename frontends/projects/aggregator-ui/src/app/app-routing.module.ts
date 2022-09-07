import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

const routes: Routes = [
  { component: DashboardComponent, path: '' },
  { component: LoginPageComponent, path: 'login' },
  { component: PageNotFoundComponent, path: '**' }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes)]
})
export class AppRoutingModule { }
