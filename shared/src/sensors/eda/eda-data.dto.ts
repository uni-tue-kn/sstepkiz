import { IsNumber } from "class-validator";

import { EdaData } from "./eda-data.interface";

export class EdaDataDto implements EdaData {

  /**
   * Eda measurent value.
   */
  @IsNumber()
  edaValue = 0;

  /**
   * UTC Date time when data was collected.
   */
  @IsNumber()
  t = new Date().getUTCDate();
}
