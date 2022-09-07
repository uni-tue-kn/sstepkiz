import { IsNumber, Max, Min } from "class-validator";

import { EyeTrackingData } from "./eyetracking-data.interface";

export class EyeTrackingDataDto implements EyeTrackingData {

  /**
   * Confidence of gaze estimation.
   */
  @IsNumber()
  @Max(1)
  @Min(0)
  c = 0;

  /**
   * UTC Date time when data was collected.
   */
  @IsNumber()
  t = new Date().getUTCDate();

  /**
   * X position on field video.
   */
  @IsNumber()
  x = 0;

  /**
   * Y position on field video.
   */
  @IsNumber()
  y = 0;
}
