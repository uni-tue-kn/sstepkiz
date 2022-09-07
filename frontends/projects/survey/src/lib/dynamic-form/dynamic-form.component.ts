import {
  Component,
  Input,
  SimpleChanges,
  OnChanges,
  Output,
  EventEmitter,
  AfterViewInit,
} from "@angular/core";
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { ExtendObservations, Instrument } from "@sstepkiz";
import { ResultPoint } from "@sstepkiz";

@Component({
  selector: "app-dynamic-form",
  templateUrl: "./dynamic-form.component.html",
  styleUrls: ["./dynamic-form.component.scss"],
})
export class DynamicFormComponent implements AfterViewInit {
  @Input() observations: ExtendObservations[] | any;
  @Input() observationNumber: number;
  @Input() instrument: Instrument;
  lengthObs: number = 0;
  @Input()
  set length(length) {
    if (length != undefined) {
      this.lengthObs = length;
    }
  }
  @Output() stopEmitter: EventEmitter<any> = new EventEmitter();
  @Output() nextEmitter: EventEmitter<number> = new EventEmitter<number>();
  @Output() resultInstrument: EventEmitter<ResultPoint[]> = new EventEmitter();

  payLoad = "";
  observation: ExtendObservations | any;
  checkboxsChecked: Map<number, boolean> = new Map();
  resultPoints: ResultPoint[] = [];

  rememberLoginControl = new FormControl();
  dontAnswer: boolean = false;

  constructor() {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.observation = this.observations.find(
        ({ observationNumber }) => observationNumber == this.observationNumber
      );
    });
  }

  /**
   * Takes the results of the instrument and builds them into the form the database needs.
   * The results are then sent to Survey Page and added to the total results.
   * @emit resultInstrument
   */

  onSubmit() {
    let resultPoints: ResultPoint[] = [];
    this.observations.forEach((observation) => {
      let value = observation.value;

      if (value != null && value != "") {
        switch (observation.dataType) {
          case "Option": {
            const resultPoint = {
              observation: { id: observation.id },
              option: { id: value },
            };
            resultPoints.push(resultPoint);
            break;
          }
          case "Checkbox": {
            //checkbox results are already added
          }
          case "String": {
            const resultPoint = {
              observation: { id: observation.id },
              textValue: value,
            };
            resultPoints.push(resultPoint);
            break;
          }
          case "Double": {
            const resultPoint = {
              observation: { id: observation.id },
              doubleValue: Number(value),
            };
            resultPoints.push(resultPoint);
            break;
          }
          case "Date": {
            let time = value;

            // A date must be inserted for the database.
            let date = new Date(1970, 1, 1, time.hour, time.minute);
            const resultPoint = {
              observation: { id: observation.id },
              dateValue: date,
            };
            resultPoints.push(resultPoint);
            break;
          }
          default: {
            console.log("something went wrong when building the result");
            break;
          }
        }
      }
    });
    this.resultPoints.push(...resultPoints);
    console.log("resultPoints", this.resultPoints);

    this.resultInstrument.emit(this.resultPoints);
  }

  isValid(): boolean {
    if (!this.observation?.optional) {
      return (
        this.observation?.value != null &&
        this.observation?.value !== undefined &&
        this.observation?.value !== ""
      );
    }
    return true;
  }

  /**
   * Skips a question, deletes already entered values and fetches the next question.
   */
  skip(): void {
    // TODO move from Reactive Forms to NGModel
    let observationId = String(this.observation.id);

    if (this.observation.dataType == "Checkbox") {
      //let newValue = this.form.controls[observationId].value;
      /*for (const key in newValue) {
        newValue[key] = false;
      }*/
      //this.form.controls[observationId].setValue(newValue);
    } else {
      //this.form.controls[observationId].setValue("");
    }

    this.getNextObservation();
  }

  getNextObservation() {
    //if observation was checkbox, result points need to be created
    if (this.observation.dataType == "Checkbox") {
      var resultPoints: ResultPoint[] = [];
      this.observation.options?.forEach((option) => {
        if (this.checkboxsChecked.get(option.id)) {
          const resultPoint = {
            observation: { id: this.observation.id },
            option: { id: option.id },
          };
          resultPoints.push(resultPoint);
        }
      });
      console.log("results points: ", resultPoints);
      this.resultPoints.push(...resultPoints);
    }

    // If survey is over.
    if (this.observation.nextObservation == null) {
      this.stopEmitter.emit();
      this.onSubmit();
      return;
    }

    // Branching through different answer options.
    if (this.observation.dataType == "Option") {
      const optionId = this.observation.value;
      const option = this.observation.options.find(
        (option) => option.id == optionId
      );
      if (option != null && option != undefined) {
        if (
          option.nextObservation != null &&
          option.nextObservation.observationNumber != null
        ) {
          this.observationNumber = option.nextObservation.observationNumber;
        } else {
          this.observationNumber =
            this.observation.nextObservation.observationNumber;
          this.observation = this.observations.find(
            ({ observationNumber }) =>
              observationNumber == this.observationNumber
          );
        }
      } else {
        this.observationNumber =
          this.observation.nextObservation.observationNumber;
        this.observation = this.observations.find(
          ({ observationNumber }) => observationNumber == this.observationNumber
        );
      }
    } else {
      this.observationNumber =
        this.observation.nextObservation.observationNumber;
      this.observation = this.observations.find(
        ({ observationNumber }) => observationNumber == this.observationNumber
      );
    }

    const nextObservation = this.observations.find(
      ({ observationNumber }) => observationNumber == this.observationNumber
    );
    if (
      nextObservation == undefined ||
      nextObservation.topic.id !== this.instrument.id
    ) {
      this.onSubmit();
      this.nextEmitter.emit(this.observationNumber);
    } else {
      this.observation = nextObservation;
    }

    //check if next is checkboxs
    if (this.observation.dataType == "Checkbox") {
      this.checkboxsChecked.clear();
      this.observation.options?.forEach((opt) => {
        this.checkboxsChecked.set(opt.id, false);
      });
    }

    //check if next is date
    if (this.observation.dataType == "Date") {
      this.observation.value = { hour: 12, minute: 0 };
    }
  }
}
