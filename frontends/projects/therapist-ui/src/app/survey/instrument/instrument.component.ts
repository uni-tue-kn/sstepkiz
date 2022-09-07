import {Component, OnDestroy, OnInit} from "@angular/core";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {MatDialog} from "@angular/material/dialog";
import {ObservationComponent} from "../observation/observation.component";
import {Router} from "@angular/router";
import {Context, CSVImportFilesDto, Instrument, Observation} from "@sstepkiz";
import {ImeraApiService} from "projects/imera-api/src/public-api";
import {StateService} from "../../Services/state.service";
import {Subscription} from "rxjs";
import {ErrorComponent} from "../../page/error/error.component";

@Component({
  selector: "app-instrument",
  templateUrl: "./instrument.component.html",
  styleUrls: ["./instrument.component.scss"],
})
export class InstrumentComponent implements OnInit, OnDestroy {
  constructor(
    private state: StateService,
    public dialog: MatDialog,
    private imeraApiService: ImeraApiService,
    private router: Router
  ) {}
  instrument: Instrument;
  observationsFromInstrument: Observation[] = [];
  text: string;
  context: Context;
  routerLinkBack: string = "/studie/befragung";
  allObservations: Observation[] = [];
  startIndex: number = 0;
  instruments: Instrument[];
  currentObservationLenght: number = 0;
  private subscriptions: Subscription[] = [];

  create(importObservations) {
    this.imeraApiService
      .createObservation(importObservations, this.context.id)
      .then((newObservation) => {
        this.router.navigate([this.routerLinkBack]);
      })
      .catch((err) => {
        if (err.status == 200) {
          this.router.navigate([this.routerLinkBack]);
        } else {
          this.openDialogError(err);
        }
      });
  }

  copy(element: Observation) {
    this.currentObservationLenght++;
    const newElement: Observation = new Observation(element);
    newElement.observationNumber = this.currentObservationLenght;
    newElement.internID = this.newinternID();
    this.observationsFromInstrument.push(newElement);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.observationsFromInstrument,
      event.previousIndex,
      event.currentIndex
    );
  }

  edit(element: Observation) {
    this.state.setCurrentObservation(element);
    this.openDialog();
  }

  newElement(): void {
    this.currentObservationLenght++;
    let element: Observation = new Observation({
      observationNumber: this.currentObservationLenght,
      internID: this.newinternID(),
      topic: {
        id: this.instrument.id,
        name: this.instrument.name,
        descriptionText: this.instrument.descriptionText,
      },
    });
    this.edit(element);
  }

  newinternID() {
    let internID = this.currentObservationLenght;
    let i = this.observationsFromInstrument.findIndex(
      (element) => element.internID == internID
    );
    while (i != -1) {
      internID++;
      i = this.observationsFromInstrument.findIndex(
        (element) => element.internID == internID
      );
    }
    i = this.allObservations.findIndex(
      (element) => element.internID == internID
    );
    while (i != -1) {
      internID++;
      i = this.observationsFromInstrument.findIndex(
        (element) => element.internID == internID
      );
    }
    return internID;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  ngOnInit(): void {
    this.context = this.state.currentContext;
    this.instrument = this.state.currentInstrument;
    this.instruments = this.state.instruments;
    this.allObservations = this.state.observations;

    // If it is not the first instrument.
    if (this.allObservations != []) {
      this.currentObservationLenght = this.allObservations.length;

      // If it is a update.
      if (this.instrument.id) {
        this.startIndex = this.allObservations.findIndex(
          (e) => this.instrument.id == e.topic.id
        );
        this.observationsFromInstrument = this.allObservations.filter(
          (observation) => observation.topic.id === this.instrument.id
        );
        this.allObservations.splice(
          this.startIndex,
          this.observationsFromInstrument.length
        );

        // If it is a new instrument.
      } else {
        this.startIndex = this.allObservations.length;
      }
    }

    console.log(
      "observation from instrument: ",
      this.observationsFromInstrument
    );

    this.text = this.context.published
      ? "Die Befragung wird durch geführt. Sie können sie nicht mehr bearbeiten."
      : "Hier können Sie die Fragen der Befragung " +
        this.context.name +
        " bearbeiten";
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ObservationComponent, {
      width: "1040px",
    });

    this.subscriptions.push(
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          const index = this.observationsFromInstrument.findIndex(
            (e) => e.internID == result.data.internID
          );
          if (index === -1) {
            this.observationsFromInstrument.push(result.data);
          } else {
            this.observationsFromInstrument[index] = result.data;
          }
        } else {
          this.currentObservationLenght--;
        }
      })
    );
  }

  openDialogError(error): void {
    const dialogRef = this.dialog.open(ErrorComponent, {
      width: "500px",
      data: { error },
    });

    this.subscriptions.push(dialogRef.afterClosed().subscribe());
  }

  remove(i: number): void {
    this.observationsFromInstrument = this.deleteObservationInList(
      this.observationsFromInstrument,
      [this.observationsFromInstrument[i]]
    );
    this.currentObservationLenght--;
    //this.observationsFromInstrument.splice(i, 1);
  }

  async save(): Promise<void> {
    // make sure that all have the correct instrument
    this.observationsFromInstrument.map((e) => {
      e.topic.name = this.instrument.name;
      e.topic.id = this.instrument.id;
      e.topic.descriptionText = this.instrument.descriptionText;
    });

    this.allObservations.splice(
      this.startIndex,
      0,
      ...this.observationsFromInstrument
    );

    // determine the order of the questions
    //TODO: delete later, this is a quick fix cause there is an api bug happening with nextObservationNumber starting from 1
    /*let nextObservationNumber = 2;
    for (let observation of this.allObservations) {
      observation.observationNumber = nextObservationNumber;
      nextObservationNumber++;
    }*/
    for (let i = 0; i < this.allObservations.length; i++) {
      this.allObservations[i].observationNumber = i + 1;
    }

    console.log("all observation: ", this.allObservations);
    for (let index = 0; index < this.allObservations.length; index++) {
      this.allObservations[index].nextObservation = this.allObservations[
        index + 1
      ]
        ? {
            observationNumber:
              this.allObservations[index + 1].observationNumber,
          }
        : { observationNumber: null };
      // If the observation has options with nextObservation the unit idetifier is convertig back to the observation number.
      if (
        this.allObservations[index].dataType == "Option" ||
        this.allObservations[index].dataType == "Integer"
      ) {
        this.allObservations[index].options.map((option) => {
          const observationNumber = option.nextObservation.observationNumber;
          if (observationNumber != null) {
            const element = this.allObservations.find(
              (element) => element.internID == observationNumber
            );
            option.nextObservation.observationNumber =
              element != undefined ? element.observationNumber : null;
          }
        });
      }
    }
    this.instruments[this.instrument.id] = this.instrument;
    this.state.setInstruments(this.instruments);
    this.state.setObservations(this.allObservations);
    const importObservations =
      this.imeraApiService.changeObservationToCSVImportFilesDto(
        this.allObservations
      );

    this.importObservations(importObservations);
  }
  importObservations(importObservations: CSVImportFilesDto) {
    this.subscriptions.push(
      this.imeraApiService
        .getObservationsByContextId(String(this.context.id))
        .subscribe((observations) => {
          if (observations.length > 0) {
            this.imeraApiService
              .deleteObservations(this.context.id)
              .then((delet) => {
                this.create(importObservations);
              })
              .catch((error) => {
                console.log(error.status);
                if (error.status == 200) {
                  this.create(importObservations);
                } else {
                  this.openDialogError(error);
                }
              });
          } else {
            this.create(importObservations);
          }
        })
    );
  }

  deleteObservationInList(
    observationList: Observation[],
    observationsToDelete: Observation[]
  ): Observation[] {
    for (let observationToDelete of observationsToDelete) {
      //check all options and remove occuring observationNumber appearances
      for (let observation of observationList) {
        let optionsWithIndexOccuring = observation.options?.filter(
          (option) =>
            option.nextObservation?.observationNumber ==
            observationToDelete.observationNumber
        );
        optionsWithIndexOccuring?.forEach(
          (option) => (option.nextObservation.observationNumber = null)
        );
      }

      let observationsWithIndexOccuring = observationList.filter(
        (observation) =>
          observation.nextObservation?.observationNumber ==
          observationToDelete.observationNumber
      );
      observationsWithIndexOccuring?.forEach(
        (observation) =>
          (observation.nextObservation = observationToDelete.nextObservation)
      );
      observationList.splice(observationList.indexOf(observationToDelete), 1);
    }
    return observationList;
  }
}
