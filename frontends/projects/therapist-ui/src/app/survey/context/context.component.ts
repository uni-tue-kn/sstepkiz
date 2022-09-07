import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Instrument } from "@sstepkiz";
import { Observation } from "@sstepkiz";
import { ImeraApiService } from "projects/imera-api/src/public-api";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import { ImportComponent } from "../import/import.component";
import { DeleteDialogComponent } from "../../page/delete/delet.component";
import { StateService } from "../../Services/state.service";
import { TimePickerComponent } from "../time-picker/time-picker.component";
import { HotToastService } from "@ngneat/hot-toast";

@Component({
  selector: "app-context",
  templateUrl: "./context.component.html",
  styleUrls: ["./context.component.scss"],
})
export class ContextComponent implements OnInit, OnDestroy {
  context: any;
  instruments: Instrument[];
  newElement: Instrument;
  observations: Observation[];
  preview = "/studie/befragung/preview";
  routerLink = "/studie/befragung/instrument";
  routerLinkBack = "/studie/befragungen";
  routerLinkCreateSchedules = "/studie/befragung/zeitplan-erstellen"
  routerLinkSchedule = "/studie/befragung/zeitplan";
  text: string;
  title: string;
  length: number = 0;
  private subscriptions: Subscription[] = [];

  constructor(private state: StateService, private imeraApiService: ImeraApiService, public dialog: MatDialog, private router: Router, private toast: HotToastService) {}

  createNewElement(): void {
    this.newElement = { id: "", name: "", descriptionText: "" };
    this.instruments.push(this.newElement);
  }

  edit(element: Instrument) {
    this.state.setCurrentInstrument(element);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  ngOnInit(): void {
    this.context = this.state.currentContext;
    this.title = this.context.name;
    this.subscriptions.push(
      this.imeraApiService.getObservationsByContextId(this.context.id).subscribe(
        (data) => {
          console.log("data: ", data);
          this.observations = data.sort((a, b) => a.observationNumber - b.observationNumber);

          // If context are imported, nextobservation = null can occur, then the value option.nextObservation.observationNumber cannot be read.
          this.observations.map((observation) => {
            console.log("observation: ", observation);
            observation.internID = observation.observationNumber;
            if (observation.options) {
              observation.options.map((option) => {
                if (option.nextObservation == null) {
                  option.nextObservation = { observationNumber: null };
                }
              });
            }
          });

          this.instruments = data ? this.imeraApiService.getInstruments(this.observations) : [];
          this.length = this.instruments.length;
          this.state.setInstruments(this.instruments);
          this.state.setObservations(this.observations);
        },
        (error) => {
          console.log("error: ", error);
          this.toast.error("Coudld't load observations!");
        }
      )
    );

    this.text = this.context.published ? "Die Befragung wird durchgeführt. Sie können sie nicht mehr bearbeiten." : "Hier können Sie Befragung " + this.title + " bearbeiten.";
  }

  navigateToTimePicker(): void {
    this.router.navigate([this.routerLinkCreateSchedules])
  }

  openDialogImport(): void {
    const dialogRef = this.dialog.open(ImportComponent, {
      width: "500px",
    });
    dialogRef.componentInstance.update = true;
    dialogRef.afterClosed();
  }

  openDialogDelete(id: string, index: number): void {
    console.log("opening dialog delete for id: ", id);
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: "500px",
    });
    this.subscriptions.push(
      dialogRef.afterClosed().subscribe(async (result) => {
        if (result.sucessfull) {
          const instrumentToRemove = this.instruments.splice(index, 1);
          console.log("observations before remove: ", this.observations);
          let observationsToDelete = this.observations.filter((observation) => observation.topic.id == id);
          this.observations = this.deleteObservationInList(this.observations, observationsToDelete);
          this.state.setObservations(this.observations);
          console.log("observations: ", this.observations);
          const importFile = this.imeraApiService.changeObservationToCSVImportFilesDto(this.observations);
          this.imeraApiService.getObservationsByContextId(this.context.id).subscribe((observations) => {
            if (observations.length > 0) {
              this.imeraApiService
                .deleteObservations(this.context.id)
                .then(() => {
                  if (this.observations.length > 0) {
                    this.imeraApiService.createObservation(importFile, this.context.id).then(
                      (data) => console.log(data),
                      (err) => console.log("error while creating observations: ", err)
                    );
                  }
                })
                .catch((error) => console.error("delete observations error for ", this.context.id, ": ", error));
            } else {
              this.imeraApiService
                .createObservation(importFile, this.context.id)
                .then((data) => console.log(data))
                .catch((err) => console.log(err));
            }
          });
        }
      })
    );
  }

  openPreview() {
    this.state.setCurrentContextId(this.context.id);
    this.router.navigate([this.preview]);
  }

  save() {
    this.imeraApiService.updateContext(this.context);
    this.router.navigate([this.routerLinkBack]);
  }

  deleteObservationInList(observationList: Observation[], observationsToDelete: Observation[]): Observation[] {
    for (let observationToDelete of observationsToDelete) {
      console.log("observation to delete number: ", observationToDelete.observationNumber);

      //check all options and remove occuring observationNumber appearances
      for (let observation of observationList) {
        let optionsWithIndexOccuring = observation.options?.filter((option) => option.nextObservation?.observationNumber == observationToDelete.observationNumber);
        optionsWithIndexOccuring?.forEach((option) => (option.nextObservation.observationNumber = null));
      }

      let observationsWithIndexOccuring = observationList.filter((observation) => observation.nextObservation?.observationNumber == observationToDelete.observationNumber);
      console.log("observationsWithIndexOccuring: ", observationsWithIndexOccuring);
      observationsWithIndexOccuring?.forEach((observation) => (observation.nextObservation = observationToDelete.nextObservation));
      observationList.splice(observationList.indexOf(observationToDelete), 1);
    }

    return observationList;
  }
}
