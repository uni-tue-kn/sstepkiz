import { Observation } from "./Observation.class";
import { ResultPoint } from "./ResultPoint.interface";

export interface ResultInstrument {
  name?: string;
  instrumentResults?: {
    created: string;
    resultPoints: ResultPoint[];
    missingResults?: string[];
    optionResults?: ResultPoint[];
    textResults?: ResultPoint[];
    timeResults?: ResultPoint[];
  }[];
  dataSets?: { avgs: number[]; labels: string[] };
  likertQuestions?: Observation[];
  textQuestions?: Observation[];
  choiceQuestions?: Observation[];
  timeQuestions?: Observation[];
}
