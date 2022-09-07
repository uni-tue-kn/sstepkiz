import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';



import { FeedbackDashboardComponent } from './feedback-dashboard/feedback-dashboard.component';

@NgModule({
  declarations: [FeedbackDashboardComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule ]
})
export class FeedbackModule {}
