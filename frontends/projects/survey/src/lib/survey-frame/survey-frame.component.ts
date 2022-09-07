import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges,} from "@angular/core";
import {ExtendObservations, Instrument, ResultPoint} from "@sstepkiz";
import {HotToastService} from "@ngneat/hot-toast";

@Component({
  selector: "app-survey-frame",
  templateUrl: "./survey-frame.component.html",
  styleUrls: ["./survey-frame.component.scss"],
})
export class SurveyFrameComponent implements OnChanges {
  @Input() isLoading: boolean = false;
  @Input() instruments: Instrument[];
  @Input() observations: ExtendObservations[];
  @Input() coins?: number;
  @Input() isSendingResult: boolean;

  @Output() resultEmitter: EventEmitter<ResultPoint[]> = new EventEmitter<
    ResultPoint[]
  >();
  resultPoints: ResultPoint[] = [];

  instrumentNumber: number = 0;
  //TODO: quick fix because first observations has to start with 2, instead of 1, because there is a backend bug
  instrumentObservations: ExtendObservations[] = [];
  observationNumber: number = 1;
  instrument: Instrument;

  length: number = 0;

  stop: Boolean = false;
  topic: Boolean = true;
  firstPage: Boolean = true;
  conName: string;
  conDesText: string;
  insName: string;
  insDesText: string;

  constructor(private toast: HotToastService) {}

  /**
   * Emits the result to the parents component.
   */
  exit(): void {
    this.resultEmitter.emit(this.resultPoints);
  }

  exitOnError(): void {
    this.resultEmitter.emit(null);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("ngOnChanges");
    if (this.observations !== null && this.observations != undefined) {
      console.log("instruments: ", this.instruments);
      console.log("observations: ", this.observations);
      this.length = this.observations.length;
      this.instrument = this.instruments[0];
      this.conName = this.observations[0].context.name;
      this.conDesText = this.observations[0].context.descriptionText;
      if (this.instrument !== null && this.instrument !== undefined) {
        this.insName = this.instrument.name;
        this.insDesText = this.instrument.descriptionText;
        this.instrumentObservations = this.observations.filter(
          (observation) => observation.topic.id == this.instrument.id
        );
      } else {
        this.toast.error("Das hat leider nicht funktioniert! Tut uns leid!");
        this.exitOnError();
      }
    }
  }

  /**
   * Makes next Instrument.
   * @param observationNumber
   */
  nextInstrument(observationNumber: number): void {
    console.log("next Instrument: ", this.instruments[this.instrumentNumber]);
    this.instrumentNumber++;
    if (
      this.instruments[this.instrumentNumber] == null ||
      this.instruments[this.instrumentNumber] == undefined
    ) {
      this.stop = true;
    } else {
      console.log("next Instrument: ", this.instruments[this.instrumentNumber]);
      this.topic = true;
      this.instrument = this.instruments[this.instrumentNumber];
      this.observationNumber = observationNumber;
      this.insName = this.instrument.name;
      this.insDesText = this.instrument.descriptionText;
      this.instrumentObservations = this.observations.filter(
        (observation) => observation.topic.id == this.instrument.id
      );
    }
  }

  /**
   * Combines the results from the instruments
   * @param resultInstrument  emit from dynamic-form
   */
  saveResult(resultInstrument: ResultPoint[]) {
    this.resultPoints =
      this.resultPoints == undefined
        ? resultInstrument
        : this.resultPoints.concat(resultInstrument);
  }
}
