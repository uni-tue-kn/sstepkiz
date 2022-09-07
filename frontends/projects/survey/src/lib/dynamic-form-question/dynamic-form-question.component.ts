import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { FormGroup, FormControl, FormArray } from "@angular/forms";

import { ExtendObservations } from "@sstepkiz";

@Component({
  selector: "app-observation",
  templateUrl: "./dynamic-form-question.component.html",
  styleUrls: ["./dynamic-form-question.component.scss"],
})
export class DynamicFormQuestionComponent implements OnChanges {
  @Input() observation: ExtendObservations | any;
  @Input() checkboxsChecked: Map<number, boolean>;

  sliderMin: string;
  sliderMax: string;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.observation.options?.length > 1) {
      let sliderOption0: number = this.observation.options[0].numberValue;
      let sliderOption1: number = this.observation.options[1].numberValue;

      if (sliderOption0 <= sliderOption1) {
        this.sliderMin = this.observation.options[0].textValue;
        this.sliderMax = this.observation.options[1].textValue;
      } else {
        this.sliderMin = this.observation.options[1].textValue;
        this.sliderMax = this.observation.options[0].textValue;
      }
    }
  }

  asString(num: number) {
    return String(num);
  }

  formatSliderThumbLabel(value: number) {
    return value;
  }
}
