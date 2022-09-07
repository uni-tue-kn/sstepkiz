import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { Context } from "@sstepkiz";
import { ContextSchedule } from "@sstepkiz";
import { ImeraApiService } from "projects/imera-api/src/public-api";
import { StateService } from "../../Services/state.service";
import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";
import { HotToastService } from "@ngneat/hot-toast";

@Component({
  selector: "app-context-schedule",
  templateUrl: "./context-schedule.component.html",
  styleUrls: ["./context-schedule.component.scss"],
})
export class ContextScheduleComponent implements OnDestroy {
  schedules: ContextSchedule[];
  displayedColumns: string[] = ["select", "patient", "start", "end", "mandatory"];
  dataSource = new MatTableDataSource<ContextSchedule>();
  selection = new SelectionModel<ContextSchedule>(true, []);
  context: Context;
  text: string;
  subscriptions: Subscription[] = [];

  routerLinkBack = "/studie/befragung";
  constructor(private imeraService: ImeraApiService, private state: StateService, private toaster: HotToastService) {
    this.context = this.state.currentContext;
    //toaster.loading('Laden')
    this.imeraService.getContextSchedulesByContext(String(this.context.id)).subscribe((data) => {
      this.schedules = data;
      this.dataSource.data = this.schedules;
      this.editSchedules();
    });
    this.text = "Hier sehen Sie die Termine für die Befragung " + this.context.name;
  }

  delete() {
    this.selection.selected.forEach((schedule) => {
      let index: number = this.schedules.findIndex((d) => d === schedule);

      this.subscriptions.push(
        this.imeraService
          .deleteContextSchedule(schedule.id)
          .pipe(
            this.toaster.observe({
              loading: "Löschen",
              success: "Erfolgreich",
              error: "Fehlgeschlagen",
            })
          )
          .subscribe(
            (data) =>
              this.subscriptions.push(
                this.imeraService.getContextSchedulesByContext(String(this.context.id)).subscribe((data) => {
                  this.schedules = data;
                  this.dataSource.data = this.schedules;
                  this.editSchedules();
                })
              ),
            (error) => {
              console.log("delete error: ", error);
              this.subscriptions.push(
                this.imeraService.getContextSchedulesByContext(String(this.context.id)).subscribe((data) => {
                  this.schedules = data;
                  this.dataSource.data = this.schedules;
                  this.editSchedules();
                })
              );
            }
          )
      );

      this.selection = new SelectionModel<ContextSchedule>(true, []);
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  editSchedules() {
    this.schedules.forEach((element) => {
      let endTimestamp = new Date(element.beginTimestamp);
      endTimestamp.setSeconds(element.duration);
      element.endTime = endTimestamp;
    });
  }

  // table selection
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  selectAllToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  checkboxLabel(row?: ContextSchedule): string {
    if (!row) {
      return `${this.isAllSelected() ? "deselect" : "select"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.id}`;
  }
}
