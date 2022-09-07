import { Options } from "./Options.class";

export class Observation {
  id: number | undefined;
  internID: number | undefined;
  observationNumber: number | undefined;
  topic:
    | {
        id?: string;
        name?: string;
        descriptionText?: string;
      }
    | undefined;
  options: Options[] | undefined;
  context:
    | {
        id: string;
        name: string;
        descriptionText: string;
      }
    | undefined;
  dataType: string;
  text: string;
  unit: number | undefined;
  flag_singlechoice: boolean;
  nextObservation: { id?: number; observationNumber?: number | null } | undefined;
  optional: boolean;
  scale:
    | {
        name: string;
      }
    | undefined;
  lowerBound: number | undefined;
  upperBound: number | undefined;
  stepSize: number | undefined;

  constructor(
    options: {
      id?: number;
      internID?: number;
      observationNumber?: number;
      topic?: {
        id?: string;
        name?: string;
        descriptionText?: string;
      };
      options?: Options[];
      context?: {
        id: string;
        name: string;
        descriptionText: string;
      };
      dataType?: string;
      text?: string;
      unit?: number;
      flag_singlechoice?: boolean;
      nextObservation?: { id?: number; observationNumber?: number };
      optional?: boolean;
      scale?: {
        name: string;
      };
      lowerBound?: number;
      upperBound?: number;
      stepSize?: number;
    } = {}
  ) {
    (this.id = options.id || undefined),
      (this.internID = options.internID || undefined),
      (this.observationNumber = options.observationNumber),
      (this.topic = options.topic || undefined),
      (this.options = options.options || undefined),
      (this.context = options.context || undefined),
      (this.dataType = options.dataType || ""),
      (this.text = options.text || ""),
      (this.unit = options.unit || undefined),
      (this.flag_singlechoice = options.flag_singlechoice || false),
      (this.nextObservation = options.nextObservation || undefined),
      (this.optional = options.optional || true),
      (this.scale = options.scale || undefined),
      (this.lowerBound = options.lowerBound || undefined),
      (this.upperBound = options.upperBound || undefined),
      (this.stepSize = options.stepSize || undefined);
  }
}
