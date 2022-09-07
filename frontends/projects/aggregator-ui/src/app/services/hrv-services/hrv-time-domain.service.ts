import { Injectable } from '@angular/core';

import { std, mean } from 'mathjs';
import { HrvTimeDomain } from '../../interfaces/ecg-data';

@Injectable({
  providedIn: 'root'
})
export class HrvTimeDomainService {

  twmaSamples = 0;
  twmaSum = 0;

  twmaDiffSquareSum = 0;
  twmaPnn50Sum = 0;
  twmaVarSum = 0;

  twmaAvg = 0;
  twmaMeanHr = 0;
  twmaSdnn = 0;
  twmaRmssd = 0;
  twmaPnn50 = 0;

  nn50 = 0;


  constructor() { }

  /**
   * Gets the current time domain values
   * @param values    Current nnValues sample
   * @returns         HrvTimeDomain
   */
  getTimeDomain(nnValues: number[]): HrvTimeDomain {
    const timeDomain: HrvTimeDomain = {
      meanHr: this.calculateMeanHr(nnValues),
      sdnn: this.calculateSDNN(nnValues),
      rmssd: this.calculateRMSSD(nnValues),
      nn50: this.calculateNN50(nnValues),
      pnn50: this.calculatePNN50(nnValues)
    };
    return timeDomain;
  }


  addValue(nnValue: number, nnTime: number, prevNnValue: number): void {
    // Helper values
    this.twmaSamples++;

    // Twma Helper values
    this.twmaSum += nnValue;
    this.twmaAvg = this.twmaSum / this.twmaSamples;
    this.twmaDiffSquareSum += Math.pow(nnValue - prevNnValue, 2);
    this.twmaVarSum += Math.pow(nnValue - this.twmaAvg, 2);
    this.twmaPnn50Sum += (this.isNn50(nnValue, prevNnValue)? 1 : 0);

    // Actual values
    this.twmaMeanHr = 60000 / this.twmaAvg;
    this.twmaSdnn = this.twmaVarSum / this.twmaSamples;
    this.twmaRmssd = Math.sqrt(this.twmaDiffSquareSum / this.twmaSamples);
    this.twmaPnn50 = this.twmaPnn50Sum / this.twmaSamples
  }


  removeValue(nnValue: number, prevNnValue: number): void {
    // General helper values
    this.twmaSamples--;

    // Twma Helper values
    this.twmaSum -= nnValue;
    this.twmaAvg = this.twmaSum / this.twmaSamples;
    this.twmaDiffSquareSum -= Math.pow(nnValue - prevNnValue, 2);
    this.twmaVarSum -= Math.pow(nnValue - this.twmaAvg, 2);
    this.twmaPnn50Sum -= (this.isNn50(nnValue, prevNnValue)? 1 : 0);

    // Actual values
    this.twmaMeanHr = 60000 / this.twmaAvg;
    this.twmaSdnn = this.twmaVarSum / this.twmaSamples;
    this.twmaRmssd = Math.sqrt(this.twmaDiffSquareSum / this.twmaSamples);
    this.twmaPnn50 = this.twmaPnn50Sum / this.twmaSamples;
  }


  isNn50(nnValue: number, prevNnValue: number): boolean {
    return (Math.abs(nnValue - prevNnValue) > 50);
  }










  /**
   * Calculates the mean Hear of the current nnIntervals
   * @param values
   */
  private calculateMeanHr(values: number[]): number {
    return 60000 / mean(values);
  }



  /**
   * Calculates the hrv SDNN value using the current nnIntervals
   * @param values      nnValues
   */
  private calculateSDNN(values: number[]): number {
    return std(values, 'uncorrected');
  }

  /**
   * Calculates the hrv RMSSD value using the current nnIntervals
   * @param values      nnValues
   */
  private calculateRMSSD(values: number[]): number {
    const n = values.length;
    const diffs = this.calculateNNDiffsSum(values);
    const centering = values.reduce((acc, curr) => acc + diffs, 0) / (n - 1);
    return Math.sqrt(centering);
  }

  /**
   * Helper function to calculate the sum of differences between neighboring nnIntervals
   * @param values      nnValues
   */
  private calculateNNDiffsSum(values: number[]): number {
    const n = values.length;
    let sum = 0;
    for (let i = 0; i < n - 1; i++) {
      sum += Math.pow(values[i + 1] - values[i], 2);
    }
    return sum / n;
  }

  /**
   * Calculates the number of successive nnIntervals with a difference of OVER 50ms in the sampling window
   * @param values      nnValues
   */
  private calculateNN50(values: number[]): number {
    const n = values.length;
    let sum = 0;
    for (let i = 0; i < n - 1; i++) {
      const diff = Math.abs(values[i + 1] - values[i]);
      sum += (diff > 50) ? 1 : 0;
    }
    return sum;
  }


  /**
   * Calculates the percentage of successive nnIntervals with a difference of OVER 50ms in the sampling window
   * @param values      nnValues
   */
  private calculatePNN50(values: number[]): number {
    const n = values.length;
    let sum = 0;
    for (let i = 0; i < n - 1; i++) {
      const diff = Math.abs(values[i + 1] - values[i]);
      sum += (diff > 50) ? 1 : 0;
    }
    return sum / (n - 1);
  }
}
