import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ContextOverviewComponent } from "./context-overview/context-overview.component";
import { ObservationComponent } from "./observation/observation.component";
import { InstrumentComponent } from "./instrument/instrument.component";
import { TimePickerComponent } from "./time-picker/time-picker.component";
import { ContextComponent } from "./context/context.component";
import { ContextNewComponent } from "./context-new/context-new.component";
import { ImportComponent } from "./import/import.component";
import { ContextScheduleComponent } from "./context-schedule/context-schedule.component";
import { IntermediatePageComponent } from "./context-new/intermediate-page/intermediate-page.component";
import { AppRoutingModule } from "../app-routing.module";
import { PageModule } from "../page/page.module";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatListModule } from "@angular/material/list";
import { MatDialogModule } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { DownloadeComponent } from "./downloade/downloade.component";
import { PreviewComponent } from "./preview/preview.component";
import { SurveyLibModule } from "projects/survey/src/public-api";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatTableModule } from "@angular/material/table";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import { WeeklyContextScheduleComponent } from './time-picker/weekly-context-schedule/weekly-context-schedule.component';
import { FreeContextScheduleComponent } from './time-picker/free-context-schedule/free-context-schedule.component';
import { DailyContextScheduleComponent } from './time-picker/daily-context-schedule/daily-context-schedule.component';

@NgModule({
  declarations: [
    ContextOverviewComponent,
    ObservationComponent,
    InstrumentComponent,
    TimePickerComponent,
    ContextComponent,
    ContextNewComponent,
    ImportComponent,
    ContextScheduleComponent,
    IntermediatePageComponent,
    DownloadeComponent,
    PreviewComponent,
    WeeklyContextScheduleComponent,
    FreeContextScheduleComponent,
    DailyContextScheduleComponent,
  ],
  exports: [
    ContextOverviewComponent,
    ObservationComponent,
    InstrumentComponent,
    TimePickerComponent,
    ContextComponent,
    ContextNewComponent,
    ImportComponent,
    ContextScheduleComponent,
  ],
    imports: [
        CommonModule,
        AppRoutingModule,
        PageModule,
        ReactiveFormsModule,
        DragDropModule,
        MatInputModule,
        MatDatepickerModule,
        MatListModule,
        MatCheckboxModule,
        MatDialogModule,
        MatMomentDateModule,
        MatCardModule,
        MatProgressBarModule,
        MatTooltipModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        FormsModule,
        SurveyLibModule,
        MatSortModule,
        MatButtonToggleModule,
    ],
})
export class SurveyModule {}
