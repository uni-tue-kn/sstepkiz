import { SensorData } from "../sensor-data.interface";

export interface EcgData extends SensorData {

  /**
   * Point in time of the measurement.
   */
  t: number;

  /**
   * Heart Rate value.
   */
  heartRate: number;

  /**
   * Current rrInterval.
   */
  rrInterval: number;

  /**
   * Heart Rate value.
   */
  meanHr: number;

  /**
   * Size of the sample used to calculate hrv values.
   */
  sampleSize: number;

  /**
   * If the samples were gathered for a longer time (=> scanPeriod).
   */
  consistent: boolean;

  /**
   * Hrv SDNN of the sample.
   */
  sdnn: number;

  /**
   * Hrv RMSSD of the sample.
   */
  rmssd: number;

  /**
   * Hrv NN50 of the sample
   */
  nn50?: number;

  /**
   * Hrv pNN50 of the sample
   */
  pnn50?: number;

  /**
   * Hrv VLF value of the frequency domain of the sample.
   */
  vlf: number;

  /**
   * Hrv LF value of the frequency domain of the sample.
   */
  lf: number;

  /**
   * Hrv HF value of the frequency domain of the sample.
   */
  hf: number;

  /**
   * Hrv the ratio of lf to hf of the frequency domain of the sample.
   */
  lfHfRatio: number;
}

// Data send from the Device containing actual voltage data
export interface EcgVoltageData {
  /*
   * voltage value sent by the device
   */
  voltage: number;
  /*
   * timestamp of voltage data
   */
  timestamp: number;
}
