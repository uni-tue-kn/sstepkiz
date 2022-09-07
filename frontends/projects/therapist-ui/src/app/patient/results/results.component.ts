import { Component } from "@angular/core";
import { ImeraApiService } from "projects/imera-api/src/public-api";
import {
  Result,
  Observation,
  ResultInstrument,
  ResultPoint,
  Options,
} from "@sstepkiz";
import { FormControl, FormGroup } from "@angular/forms";

import { StateService } from "../../Services/state.service";
import { molarVolumeDependencies, ResultSetDependencies } from "mathjs";

@Component({
  selector: "app-results",
  templateUrl: "./results.component.html",
  styleUrls: ["./results.component.scss"],
})
export class ResultsComponent {
  routerLinkBack: string = "/studie/patienten/patient/ergebnisseueberblick";

  showResults: boolean = false;

  text: string = "Das sind die Ergebnisse von " + this.state.currentUser.name;

  instruments: ResultInstrument[];

  timeRageEmpty: boolean = false;

  lastResult: Result;

  integerObservations;

  optionObservations;
  textObservations;
  timeObservations;

  start: Date;
  end: Date;

  /**
   * Date picker
   */
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  constructor(
    public readonly state: StateService,
    private imeraApiService: ImeraApiService
  ) {
    this.imeraApiService
      .getObservationsByContextId(this.state.currentContextId)
      .subscribe((data) => {
        //sort all observations by their type
        let observations = data;

        this.integerObservations = observations.filter(
          (observation) => observation.dataType == "Integer"
        );
        console.log("integeger observations: ", this.integerObservations);
        this.optionObservations = observations.filter(
          (observation) => observation.dataType == "Option"
        );
        this.textObservations = observations.filter(
          (observation) => observation.dataType == "String"
        );
        this.timeObservations = observations.filter(
          (observation) => observation.dataType == "Date"
        );
      }),
      (error) => console.log(error);
  }

  show() {
    this.start = new Date(this.range.value.start);
    this.end = new Date(this.range.value.end);
    const resultsRange: Result[] = this.filterDate();

    if (resultsRange.length > 0) {
      this.timeRageEmpty = false;
      let sortInstruments: ResultInstrument[] =
        this.sortInstruments(resultsRange);
      this.separate(sortInstruments);
      this.addAvgsLables(sortInstruments);
      console.log("sort Instruments: ", sortInstruments);

      this.instruments = sortInstruments;

      this.instruments = this.integerMissingTable(
        this.instruments,
        this.integerObservations
      );
      this.instruments = this.optionsTable(
        this.instruments,
        this.optionObservations
      );
      this.instruments = this.textTable(
        this.instruments,
        this.textObservations
      );
      this.instruments = this.timeTable(
        this.instruments,
        this.timeObservations
      );
      this.showResults = true;
    } else {
      this.showResults = false;
      this.timeRageEmpty = true;
      let result = this.state.currentResults;
      this.lastResult = result.pop();
    }
  }

  /**
   * Sorts out the results that are not in the specified time window.
   */
  filterDate(): Result[] {
    let results = this.state.currentResults.filter(
      (result) =>
        this.start <= new Date(result.created) &&
        this.end >= new Date(result.created)
    );
    return results;
  }

  /**
   * Sorts the result points into instruments
   * @param results
   * @returns instruments: { name: string, results: { created: Date, resultPoints: ResultPoint[] }[] }[]
   */
  sortInstruments(results: Result[]): ResultInstrument[] {
    let instruments: ResultInstrument[] = [];

    results.forEach((result) => {
      for (const resultPoint of result.resultPoints) {
        let resultObservation = resultPoint.observation as Observation;
        let index = instruments.findIndex(
          (instrument) => instrument.name == resultObservation.topic.name
        );
        if (index === -1) {
          instruments.push({
            name: resultObservation.topic.name,
            instrumentResults: [
              { created: result.created, resultPoints: [resultPoint] },
            ],
          });
        } else {
          let indexResult = instruments[index].instrumentResults.findIndex(
            (instrumentResult) => result.created == instrumentResult.created
          );
          if (indexResult === -1) {
            instruments[index].instrumentResults.push({
              created: result.created,
              resultPoints: [resultPoint],
            });
          } else {
            instruments[index].instrumentResults[indexResult].resultPoints.push(
              resultPoint
            );
          }
        }
      }
    });

    return instruments;
  }

  /**
   * Separates text and date entries from numbers values.
   * @param instruments
   *
   */
  separate(instruments: ResultInstrument[]): void {
    instruments.forEach((instrument) => {
      instrument.instrumentResults.forEach((result) => {
        console.log("result: ", result);
        result.optionResults = result.resultPoints.filter(
          (resultPoint) =>
            (resultPoint.observation as Observation).dataType === "Option"
        );
        result.textResults = result.resultPoints.filter(
          (resultPoint) =>
            (resultPoint.observation as Observation).dataType === "String"
        );
        result.timeResults = result.resultPoints.filter(
          (resultPoint) =>
            (resultPoint.observation as Observation).dataType === "Date"
        );

        result.optionResults.forEach((resultPoint) => {
          result.resultPoints.splice(
            result.resultPoints.indexOf(resultPoint),
            1
          );
        });
        result.textResults.forEach((resultPoint) => {
          result.resultPoints.splice(
            result.resultPoints.indexOf(resultPoint),
            1
          );
        });
        result.timeResults.forEach((resultPoint) => {
          result.resultPoints.splice(
            result.resultPoints.indexOf(resultPoint),
            1
          );
        });

        console.log("instrumentresult: ", result);
      });
    });
  }

  integerMissingTable(
    instruments: ResultInstrument[],
    integerObservations: Observation[]
  ) {
    instruments.forEach((instrument) => {
      instrument.likertQuestions = integerObservations.filter(
        (observation) => observation.topic.name == instrument.name
      );
      console.log("instrument");

      if (instrument.likertQuestions.length > 0) {
        instrument.instrumentResults.forEach((result) => {
          let missingResults = [];
          for (const observation of instrument.likertQuestions) {
            let existingResults = result.resultPoints.filter(
              (resultPoint) => resultPoint.observation.id == observation.id
            );
            if (existingResults.length < 1) {
              missingResults.push(observation.text);
            }
          }
          result.missingResults = missingResults;
        });
      }
    });
    console.log("instruments: ", instruments);
    return instruments;
  }

  textTable(instruments: ResultInstrument[], textObservations: Observation[]) {
    instruments.forEach((instrument) => {
      instrument.textQuestions = textObservations.filter(
        (observation) => observation.topic.name == instrument.name
      );
      console.log("text questions: ", instrument.textQuestions);
      if (instrument.textQuestions.length > 0) {
        instrument.instrumentResults.forEach((result) => {
          let textTable = [];
          result.textResults.forEach((element) => {
            let index = instrument.textQuestions.findIndex(
              (question) => element.observation.id == question.id
            );
            textTable[index] = element;
          });
          result.textResults = textTable;
        });
      }
    });
    return instruments;
  }

  timeTable(instruments: ResultInstrument[], timeObservations: Observation[]) {
    instruments.forEach((instrument) => {
      instrument.timeQuestions = timeObservations.filter(
        (observation) => observation.topic.name == instrument.name
      );
      if (instrument.timeQuestions.length > 0) {
        instrument.instrumentResults.forEach((result) => {
          let timeTable = [];
          result.timeResults.forEach((element) => {
            let index = instrument.timeQuestions.findIndex(
              (question) => element.observation.id == question.id
            );
            timeTable[index] = element;
          });
          result.timeResults = timeTable;
        });
      }
    });
    return instruments;
  }

  optionsTable(
    instruments: ResultInstrument[],
    optionObservations: Observation[]
  ) {
    instruments.forEach((instrument) => {
      instrument.choiceQuestions = optionObservations.filter(
        (observation) => observation.topic.name == instrument.name
      );
      if (instrument.choiceQuestions.length > 0) {
        instrument.instrumentResults.forEach((result) => {
          let optionsTable = [];
          result.optionResults.forEach((element: ResultPoint) => {
            console.log("element: ", element);
            let index = instrument.choiceQuestions.findIndex(
              (question) => element.observation.id == question.id
            );
            if (
              optionsTable[index] !== null &&
              optionsTable[index] !== undefined &&
              !element.observation.flag_singlechoice
            ) {
              optionsTable[index].option.textValue =
                optionsTable[index].option.textValue +
                ", " +
                element.option?.textValue;
            } else {
              optionsTable[index] = element;
            }
          });
          console.log("options table: ", optionsTable);
          result.optionResults = optionsTable;
        });
      }
    });
    return instruments;
  }

  /**
   * creats the Labels vor the Chart. Every Day from start to end
   * @param start
   * @param end
   * @returns
   */
  createLabels(start: Date, end: Date): string[] {
    let labels = [start.toLocaleString()];
    let day: Date = start;
    let maxDay = 0;
    while (end != day && maxDay <= 60) {
      day.setDate(day.getDate() + 1);
      labels.push(day.toLocaleString());
      maxDay++;
    }
    return labels;
  }

  createAvgsLabels(results): { avgs: number[]; labels: string[] } {
    let avgs = [];
    let labels = [];

    for (let index = 0; index < results.length; index++) {
      let avgResult: number = null;

      if (results[index].resultPoints.length > 0) {
        avgResult = this.calcAvg(results[index].resultPoints);

        const day: Date = new Date(results[index].created);
        avgs.push(avgResult);
        labels.push(day.toLocaleString());

        if (results[index + 1]) {
          const nextDay: Date = new Date(day.setDate(day.getDate() + 1));
          const nextResult: Date = new Date(results[index + 1].created);

          // if days are between current result and next result (currend and next result can be the same day)
          if (
            nextDay != nextResult &&
            day.toLocaleDateString() != nextDay.toLocaleDateString()
          ) {
            let extraLabels = this.createLabels(day, nextResult);
            avgs.push(...Array(extraLabels.length).fill(null));
            labels.push(...extraLabels);
          }
        }
      }

      /*const day: Date = new Date(results[index].created);
      avgs.push(avgResult);
      labels.push(day.toLocaleString());

      if (results[index + 1]) {
        const nextDay: Date = new Date(day.setDate(day.getDate() + 1));
        const nextResult: Date = new Date(results[index + 1].created);

        // if days are between current result and next result (currend and next result can be the same day)
        if (nextDay != nextResult && day.toLocaleDateString() != nextDay.toLocaleDateString()) {
          let extraLabels = this.createLabels(day, nextResult);
          avgs.push(...Array(extraLabels.length).fill(null));
          labels.push(...extraLabels);
        }
      }*/
    }
    return { avgs, labels };
  }

  /**
   * Adds Lables and Avg
   * @param instruments
   * @returns
   */
  addAvgsLables(instruments: ResultInstrument[]) {
    console.log("add avgs...");
    instruments.forEach((instrument) => {
      console.log("instrument: ", instrument);
      let avgsLabels = this.createAvgsLabels(instrument.instrumentResults);
      instrument.dataSets = avgsLabels;
    });
  }

  /**
   * Calculates the average value
   * @param resultPoints
   * @returns
   */
  calcAvg(resultPoints: ResultPoint[]): number {
    let value = 0;
    let count = 0;
    resultPoints.forEach((resultp) => {
      let obs: Observation = resultp.observation as Observation;
      if (obs != null && obs !== undefined && obs.dataType !== "Option") {
        count += 1;
        if (resultp.option != null && resultp.option !== undefined) {
          value += (resultp.option as Options).numberValue;
        } else {
          value += resultp.intValue + resultp.doubleValue;
        }
      }
    });
    return value / count;
  }
}
