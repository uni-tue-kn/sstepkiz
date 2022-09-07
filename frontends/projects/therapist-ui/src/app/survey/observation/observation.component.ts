import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { MatDialogRef } from "@angular/material/dialog";
import { Observation } from "@sstepkiz";
import { Options } from "@sstepkiz";
import { StateService } from "../../Services/state.service";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Context } from "@sstepkiz";

@Component({
  selector: "app-observation",
  templateUrl: "./observation.component.html",
  styleUrls: ["./observation.component.scss"],
})
export class ObservationComponent implements OnInit {
  // @Input() published: boolean;
  @Output() saveEmitter: EventEmitter<any> = new EventEmitter();

  title: string;
  currentObservation: Observation;
  typ: string;
  types: Object[] = [
    { title: "Freitext", typ: "String" },
    { title: "Choice", typ: "Option" },
    { title: "Likert-Skala", typ: "Integer" },
    { title: "Skala", typ: "Double" },
    { title: "Zeit", typ: "Date" },
  ];
  options: Options[] = [];
  questionForm: FormGroup;
  context: Context;
  upperBondIndex: number = 0;
  lowerBondIndex: number = 1;

  constructor(
    private state: StateService,
    public dialogRef: MatDialogRef<ObservationComponent>,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.currentObservation = this.state.currentObservation;
    this.context = this.state.currentContext;
    this.title = "Frage " + this.currentObservation.internID;

    if (this.currentObservation.dataType == "") {
      this.currentObservation.dataType = "String";
    }

    // if options are empty, init with two empty options
    this.options =
      this.currentObservation.options == null
        ? [new Options(), new Options()]
        : this.currentObservation.options;
    this.options.sort((a, b) => a.numberValue - b.numberValue);
  }

  save() {
    if (
      this.currentObservation.dataType == "Option" ||
      this.currentObservation.dataType == "Integer"
    ) {
      this.currentObservation.options = this.options;
    } else if (this.currentObservation.dataType == "Double") {
      this.currentObservation.options = this.options;
      this.currentObservation.lowerBound =
        this.options[this.upperBondIndex].numberValue;
      this.currentObservation.upperBound =
        this.options[this.lowerBondIndex].numberValue;
    } else {
      this.currentObservation.options = [];
    }
    console.log("saved observation: ", this.currentObservation);
    this.dialogRef.close({ event: "close", data: this.currentObservation });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.options, event.previousIndex, event.currentIndex);
  }

  copy(element: Options) {
    this.options.push(element);
  }

  remove(i: number): void {
    const remove = this.options.splice(i, 1);
  }

  newElement(): void {
    const element: Options = new Options();
    this.options.push(element);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onTypeChanged(value) {
    if (value == "Integer") {
      this.currentObservation.flag_singlechoice = true;
    }
  }
}
