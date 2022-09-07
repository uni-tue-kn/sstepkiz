import { Observation } from "./Observation.class";
import { Options } from "./Options.class";

export interface ResultPoint {
  // When the ResultPoint is sent, it has only id. If ResultPoint is called from the Server,
  //it has the complete observation
  observation: { id: number; flag_singlechoice?: boolean } | Observation;
  // Id comes from the server. Has only id when the ResultPoint is retrieved from the server.
  id?: number;
  boolValue?: boolean;
  textValue?: string;
  intValue?: number;
  doubleValue?: number;
  dateValue?: Date;
  // Need id to send, get options back
  option?: { id: number; textValue?: string } | Options;
}
