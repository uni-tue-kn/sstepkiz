// Todo get inheritenc to work
// import { Options } from './Options.class';
// import { Observation } from 'src';

// export class ExtendObservations extends Observation{
//   class: string;
//   type: string;
//   time: { hour: number | undefined, minute: number | undefined };
//   inputClass: string | undefined;
//   integer: boolean | undefined;

//   constructor(
//     options: {
//       id?: number,
//       observationNumber?: number,
//       topic?: {
//         id?: string,
//         name?: string
//         descriptionText?: string
//       },
//       options?: Options[],
//       context?: {
//         id: string;
//         name: string;
//         descriptionText: string;
//       },
//       dataType?: string,
//       text?: string,
//       unit?: number,
//       flag_singlechoice?: boolean,
//       nextObservation?: { id?: number, observationNumber?: number },
//       optional?: boolean,
//       scale?: {
//         name: string,
//       } | undefined
//       lowerBound?: number,
//       upperBound?: number,
//       stepSize?: number,
//       class?: string,
//       type?: string,
//       time?: { hour: number, minute: number },
//       inputClass?: string,
//       integer?: boolean,
//     } = {}) {
//       super(options)
//       this.class = options.class || '',
//       this.type = options.type || '',
//       this.time = options.time || { hour: 0o0, minute: 0o0 },
//       this.inputClass = options.inputClass;
//       this.integer = options.integer;

//   }
// }
import { Options } from "./Options.class";

export class ExtendObservations {
  id: number | undefined;
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
  nextObservation: { id?: number | undefined; observationNumber?: number | undefined } | undefined;
  optional: boolean;
  scale:
    | {
        name: string;
      }
    | undefined;
  lowerBound: number | undefined;
  upperBound: number | undefined;
  stepSize: number | undefined;
  class: string;
  type: string;
  time: { hour: number | undefined; minute: number | undefined };
  inputClass: string | undefined;
  integer: boolean | undefined;

  constructor(
    options: {
      id?: number;
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
      scale?:
        | {
            name: string;
          }
        | undefined;
      lowerBound?: number;
      upperBound?: number;
      stepSize?: number;
      class?: string;
      type?: string;
      time?: { hour: number; minute: number };
      inputClass?: string;
      integer?: boolean;
    } = {}
  ) {
    (this.id = options.id || undefined),
      (this.observationNumber = options.observationNumber || undefined),
      (this.topic = options.topic || undefined),
      (this.options = options.options || undefined),
      (this.context = options.context || undefined),
      (this.dataType = options.dataType || ""),
      (this.text = options.text || ""),
      (this.unit = options.unit || undefined),
      (this.flag_singlechoice = options.flag_singlechoice || false),
      (this.nextObservation = options.nextObservation || undefined),
      (this.optional = options.optional!),
      (this.scale = options.scale || undefined),
      (this.lowerBound = options.lowerBound || undefined),
      (this.upperBound = options.upperBound || undefined),
      (this.stepSize = options.stepSize || undefined),
      (this.class = options.class || ""),
      (this.type = options.type || ""),
      (this.time = options.time || { hour: 0o0, minute: 0o0 }),
      (this.inputClass = options.inputClass);
  }
}
