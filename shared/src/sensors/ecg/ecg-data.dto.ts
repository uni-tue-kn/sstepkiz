import { IsBoolean, IsNumber } from 'class-validator';

import { EcgData } from "./ecg-data.interface";

export class EcgDataDto implements EcgData {

  @IsNumber()
  heartRate = 0;

  /**
   * Current rrInterval.
   */
  @IsNumber()
  rrInterval = 0;

  /**
   * Heart Rate value.
   */
  @IsNumber()
  meanHr = 0;

  /**
   * Size of the sample used to calculate hrv values.
   */
  @IsNumber()
  sampleSize = 0;

  /**
   * If the samples were gathered for a longer time (=> scanPeriod).
   */
  @IsBoolean()
  consistent = false;

  /**
   * Hrv SDNN of the sample.
   */
  @IsNumber()
  sdnn = 0;


  /**
   * Hrv NN50 of the sample
   */
  @IsNumber()
  nn50 = 0;

  /**
   * Hrv pNN50 of the sample
   */
  @IsNumber()
  pnn50 = 0;

  /**
   * Hrv RMSSD of the sample.
   */
  @IsNumber()
  rmssd = 0;

  /**
   * Hrv VLF value of the frequency domain of the sample.
   */
  @IsNumber()
  vlf = 0;

  /**
   * Hrv LF value of the frequency domain of the sample.
   */
  @IsNumber()
  lf = 0;

  /**
   * Hrv HF value of the frequency domain of the sample.
   */
  @IsNumber()
  hf = 0;

  /**
   * Hrv the ratio of lf to hf of the frequency domain of the sample.
   */
  @IsNumber()
  lfHfRatio = 0;

  /**
   * UTC Date time when data was collected.
   */
  @IsNumber()
  t = new Date().getUTCDate();
}
