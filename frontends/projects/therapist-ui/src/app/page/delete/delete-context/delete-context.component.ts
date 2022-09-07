import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ImeraApiService } from "projects/imera-api/src/public-api";
import { HotToastService } from "@ngneat/hot-toast";

/**
 * Delete Context Dialog Component
 *
 * To be able to delete a whole context, 3 tasks need to be fired:
 * 1) deleting the corresponding schedules
 * 2) deleting the corresponding observations
 * 3) deleting the context
 *
 * Depending on the length of the schedules and the observations, this can take a longer time to process.
 */
@Component({
  selector: "app-delete-context",
  templateUrl: "./delete-context.component.html",
  styleUrls: ["./delete-context.component.scss"],
})
export class DeleteContextComponent {
  isDeletingInProgress = false;

  isDeletingContextSchedules = false;
  isDeletingContextSchedulesBlocked = true;
  isDeletingContextSchedulesFinished = false;
  contextSchedulesHasError = false;

  isDeletingObservations = false;
  isDeletingObservationsBlocked = true;
  isDeletingObservationsFinished = false;
  observationHasError = false;

  isDeletingContext = false;
  isDeletingContextBlocked = true;
  isDeletingContextFinished = false;
  contextHasError = false;

  constructor(
    public dialogRef: MatDialogRef<DeleteContextComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { contextId: string },
    private imeraApiService: ImeraApiService,
    private toast: HotToastService
  ) {}

  // delete
  async delete() {
    this.isDeletingInProgress = true;
    var sucessfull = true;

    const contextSchedules = await this.imeraApiService.getContextSchedulesByContextNew(this.data.contextId);
    this.isDeletingContextSchedules = true;
    this.isDeletingContextSchedulesBlocked = false;
    for (let index = 0; index < contextSchedules.length; index++) {
      await this.imeraApiService
        .deleteContextSchedule(contextSchedules[index].id)
        .toPromise()
        .then((res) => {
          console.log("delete contex schedules res: ", res);
        })
        .catch((err) => {
          console.log(err);
          if (err.status != 404 && err.status != 200) {
            this.contextSchedulesHasError = true;
            sucessfull = false;
            this.toast.error("Context kann nicht gelöscht werden!");
          }
        });
    }

    if (sucessfull) {
      this.isDeletingContextSchedules = false;
      this.isDeletingObservations = true;
      this.isDeletingObservationsBlocked = false;
      await this.imeraApiService
        .deleteObservations(Number(this.data.contextId))
        .then((res) => {
          console.log("delete context schedules res: ", res);
        })
        .catch((err) => {
          console.log(err);
          if (err.status != 404 && err.status != 200) {
            this.observationHasError = true;
            sucessfull = false;
            this.toast.error("Context kann nicht gelöscht werden!");
          }
        });
    }

    if (sucessfull) {
      this.isDeletingObservations = false;
      this.isDeletingContext = true;
      this.isDeletingContextBlocked = false;
      await this.imeraApiService
        .deleteContext(this.data.contextId)
        .then((result) => this.imeraApiService.loadContextList())
        .catch((err) => {
          console.log(err);
          if (err.status != 200) {
            this.contextHasError = true;
            this.isDeletingContext = false;
            sucessfull = false;
          }
        });
    }

    //if failed then sleep so the user has the chance to see where it failed
    if (!sucessfull) {
      await new Promise((f) => setTimeout(f, 5000));
    }

    this.dialogRef.close({ event: "close", sucessfull: sucessfull });
  }

  //no click
  onNoClick(): void {
    this.dialogRef.close({ event: "close", sucessfull: false });
  }
}
