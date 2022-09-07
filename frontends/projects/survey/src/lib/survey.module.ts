import { CommonModule } from "@angular/common";
import { ModuleWithProviders, NgModule } from "@angular/core";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { DynamicFormComponent } from "./dynamic-form/dynamic-form.component";
import { DynamicFormQuestionComponent } from "./dynamic-form-question/dynamic-form-question.component";
import { MatSliderModule } from "@angular/material/slider";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { SurveyFrameComponent } from "./survey-frame/survey-frame.component";
import { SurveyService } from "./survey.service";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@NgModule({
  declarations: [DynamicFormComponent, DynamicFormQuestionComponent, SurveyFrameComponent],
  imports: [CommonModule, NgbModule, ReactiveFormsModule, MatCheckboxModule, MatSliderModule, FormsModule, MatProgressSpinnerModule],
  exports: [SurveyFrameComponent],
  providers: [SurveyService],
})
export class SurveyLibModule {
  static forRoot(): ModuleWithProviders<SurveyLibModule> {
    return {
      ngModule: SurveyLibModule,
      providers: [{ provide: SurveyService }],
    };
  }
}
