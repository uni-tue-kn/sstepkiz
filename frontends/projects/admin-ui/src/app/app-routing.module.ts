import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsersComponent } from './components/users/users.component';

const routes: Routes = [
  { component: UsersComponent, path: '' },
  { component: UsersComponent, path: 'users' },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes)],
})
export class AppRoutingModule { }
