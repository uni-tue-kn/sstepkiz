import { Injectable } from '@angular/core';

import { HrvService } from '../../services/hrv-services/hrv.service';
import { EcgData, EcgGattData } from '../../interfaces/ecg-data';
import { EdaData } from '../../interfaces/eda-data';
import { MovementData } from '../../interfaces/movement-data';
import { EcgVoltageData } from '../../interfaces/ecg-voltage-data';

let ecgWriter = undefined;
let rrWriter = undefined;
window['startEcgDebug'] = async () => {
  console.log(`Starting ECG debugging...`);
  console.log(`Select ECG File`);
  const ecgHandle = await window['showSaveFilePicker']({
    types: [
      { accept: {'text/csv': ['.csv'] }, description: 'Comma-separated values' }
    ]
  });
  const ecgWriteable = await ecgHandle.createWritable();
  await ecgWriteable.write('t,ecg\n');
  console.log(`Select RR File`);
  const rrHandle = await window['showSaveFilePicker']({
    types: [
      { accept: {'text/csv': ['.csv'] }, description: 'Comma-separated values' }
    ]
  });
  const rrWriteable = await rrHandle.createWritable();
  await rrWriteable.write('t,rr\n');
  console.log(`All done! Writing ECG and RR data...`);
  ecgWriter = ecgWriteable;
  rrWriter = rrWriteable;
};
window['stopEcgDebug'] = async () => {
  const ecg = ecgWriter;
  const rr = rrWriter;
  ecgWriter = undefined;
  rrWriter = undefined;
  await Promise.all([
    ecg.close(),
    rr.close(),
  ]);
}

const MILLISECONDS_A_DAY = 1000 * 60 * 60 * 24;
const UINT32_RANGE = 4294967296;
const MAX_TRUSTWORTHY_VOLTAGE = 5000;

@Injectable({ providedIn: 'root' })
export class GattValueParserService {

  //time since last movement data
  private lastTimestamp: number = 0;

  //timestamp of first sample
  private startingTime?: number;

  /**
   * Last parsed relative timestamp.
   */
  private lastRelativeTimestamp?: number = undefined;

  /**
   * Offset in milliseconds between sensor's relative timestamp and absolute timestamp.
   */
  private relativeTimeOffset?: number = undefined;

  /**
   * Time in milliseconds without measurement errors before ECG values are trustworthy again.
   */
  private readonly minReputationTime: number = 1000;

  /**
   * Sampling rate
   */
  private readonly samplingRate: number = 250;

  /**
   * Gets the mean value of all parsed voltages.
   */
  get meanVoltage() {
    if (this.numberOfVoltages === 0) {
      return 0;
    }
    return this.voltageSum / this.numberOfVoltages;
  }

  /**
   * Sum of all parsed voltages.
   */
  private voltageSum: number = 0;

  /**
   * Number of parsed voltages.
   */
  private numberOfVoltages: number = 0;

  /**
   * Timestamp of first received ECG voltage data.
   */
  private firstEcgTime?: number = undefined;

  /**
   * Time span in milliseconds to evaluate voltages over.
   */
  private readonly evaluationSpan: number = 3000;

  /**
  * All measured voltage peaks over the last [evaluationSpan] milliseconds.
  */
  private readonly voltagePeaks: EcgVoltageData[] = [];

  /**
   * Maximum voltage value over the last [evaluationSpan] milliseconds.
   */
  private maxVoltage?: number = undefined;

  /**
   * Last received ECG voltage data.
   */
  private lastEcg?: EcgVoltageData = undefined;

  /**
   * ECG voltage data received before the [lastEcg].
   */
  private lastLastEcg?: EcgVoltageData = undefined;

  /**
   * Factor to compute R-peak threshold depending on the [maxVoltage] value.
   * @example threshold = peakFactor * maxVoltage.
   */
  private readonly peakFactor: number = 0.5;

  /**
   * Holds the state whether ECG evaluation is currently in- (true) or outside (false) an R peak.
   */
  private inR: boolean = false;

  /**
   * Timestamp of last R peak.
   */
  private lastR?: number = undefined;

  /**
   * Minimum time between two R peaks in milliseconds.
   * 150 ms ~ 400 bpm
   */

  private readonly minROffset: number = 200;

  /**
   * Maximum time between two R peaks in milliseconds.
   * 5000 ms ~ 12 bpm
   */
  private readonly maxROffset: number = 5000;

  /**
   * All measured voltage peaks since the threshold was exceeded.
   * These are potential candidates for R peaks.
   */
  private readonly currentRMaxValues: EcgVoltageData[] = [];

  constructor(private readonly hrv: HrvService) {
    this.reset();
  }

  public getBatteryData(value: DataView): number {
    return value.getUint8(0) / 100;
  }

  /**
   * Converts a DataView to an EcgData Object (by decoding and calculating HRV)
   * @param value     DataView of the GattData
   * @returns         Calculated EdaValue
   */
  public getEcgData(value: DataView): EcgData {
    const t = Date.now();
    const gattData: EcgGattData = this.parseEcgData(value);

    if (gattData.rrInterval) {
      this.hrv.addNNValue(gattData.rrInterval, t);
    }

    const data: EcgData = {
      heartRate: gattData.heartRate,
      t,
      rrInterval: gattData.rrInterval,
      sampleSize: this.hrv.sampleSize,
      meanHr: this.hrv.meanHr,
      sdnn: this.hrv.sdnn,
      rmssd: this.hrv.rmssd,
      nn50: this.hrv.nn50,
      pnn50: this.hrv.pnn50,
      vlf: this.hrv.vlf,
      lf: this.hrv.lf,
      hf: this.hrv.hf,
      lfHfRatio: this.hrv.lfHfRatio,
      consistent: (gattData.rrInterval && this.hrv.consistent)
    };
    return data;
  }

  /**
   * Converts a DataView to an EcgData Object (by decoding and calculating HRV)
   * @param value DataView of the GattData
   * @returns Calculated EdaValue
   */
  public getEdaValueData(value: DataView): EdaData {
    return this.parseEdaValue(value);
  }

  /**
   * Resets parser.
   */
  public reset(): void {
    this.startingTime = undefined;
    this.hrv.reset();
    this.firstEcgTime = undefined;
    this.voltagePeaks.length = 0;
    this.maxVoltage = undefined;
    this.lastEcg = undefined;
    this.lastLastEcg = undefined;
    this.inR = false;
    this.lastR = undefined;
    this.currentRMaxValues.length = 0;
    this.lastRelativeTimestamp = undefined;
    this.relativeTimeOffset = undefined;
    this.lastStableRRInterval = undefined;
  }

  /**
   * Parses a GATT DataView using heart_rate_measurement decoding
   * @param value    GATT Dataview
   * @returns        Decoded Ecg information from the GATT DataView
   */
  private parseEcgData(value: DataView): EcgGattData {
    const flags = value.getUint8(0);
    const rate16Bits = flags & 0x1;
    let index = 1;

    // Get the Rate rate measured
    let heartRate;
    if (rate16Bits) {
      heartRate = value.getUint16(index, /*littleEndian=*/true);
      index += 2;
    } else {
      heartRate = value.getUint8(index);
      index += 1;
    }

    // Check if a contact has been detected
    let contactDetected = !!(flags & 0x2);
    const contactSensorPresent = flags & 0x4;
    contactDetected = contactSensorPresent && contactDetected;

    // Energy expended
    let energyExpended;
    const energyPresent = flags & 0x8;
    if (energyPresent) {
      energyExpended = value.getUint16(index, /*littleEndian=*/true);
      index += 2;
    }

    // The rrInterval measured
    let rrInterval;
    const rrIntervalPresent = flags & 0x10;
    if (rrIntervalPresent) {
      rrInterval = value.getUint16(index, /*littleEndian=*/true);
    }

    const data: EcgGattData = {
      heartRate,
      contactDetected,
      energyExpended,
      rrInterval,
    };
    return data;
  }

  /**
   * Parses a GATT DataView decoding it to get a eda value
   * @param value    GATT Dataview
   * @returns        Decoded Eda information from the GATT DataView
   */
  private parseEdaValue(value: DataView): EdaData {
    // TODO REMOVE THIS
    console.warn('GattValueParserService: Eda not calculated used battery domain for gatt parsing!');
    return this.parseBatterylevel(value);
  }

  public parseNewMovementData(dataView: DataView): MovementData[][] {
    // Create index counter to iterate over received `dataView` object.
    let index = 0;

    // Parse relative timestamp and convert it to absolute timestamp.
    const relativeTimestamp = dataView.getUint32(index, true);
    const absoluteTimestamp = this.computeAbsoluteTimestamp(relativeTimestamp);
    index += 4;

    // Parse number of samples.
    const remainingBytes = dataView.byteLength - 4;
    const remainingNumberOfSamples = Math.floor(remainingBytes / (2*3*3));
    const numberOfSamples = remainingNumberOfSamples;
    // console.log(`Sample Sequence received: ${numberOfSamples}. Remaining: ${remainingNumberOfSamples}, Defined: ${definedNumberOfSamples}`);

    // Parse ECG samples.
    const samples: MovementData[][] = [[],[],[]];
    const sampleTime = 1000 / this.samplingRate;
    for (let i = 0; i < numberOfSamples; i += (2*3*3)) {
      // Compute timestamp of new sample.
      const t = Math.floor(absoluteTimestamp + ((i - numberOfSamples + 1) * sampleTime));

      // Parse sample and add it to list of samples.
      const sample = this.parseNewMovementSample(dataView, index, t);
      samples[0].push(sample[0]);
      samples[1].push(sample[1]);
      samples[2].push(sample[2]);
    }

    return samples;
  }

  private parseNewMovementSample(dataView: DataView, index: number, t: number): MovementData[] {
    const result: MovementData[] = [
      {
        timestamp: t,
        x_value: dataView.getInt16(index + 0, true) / 100,
        y_value: dataView.getInt16(index + 2, true) / 100,
        z_value: dataView.getInt16(index + 4, true) / 100,
      },
      {
        timestamp: t,
        x_value: dataView.getInt16(index + 6, true) / 10,
        y_value: dataView.getInt16(index + 8, true) / 10,
        z_value: dataView.getInt16(index + 10, true) / 10,
      },
      {
        timestamp: t,
        x_value: dataView.getInt16(index + 12, true) / 100,
        y_value: dataView.getInt16(index + 14, true) / 100,
        z_value: dataView.getInt16(index + 16, true) / 100,
      },
    ];
    return result;
  }
  /**
  * Parses the custom movement data sent by the sensor
  * @param value    GATT Dataview
  * @returns        Decoded Movement information from the GATT DataView
  */
  public parseMovementData(value: DataView): MovementData[][] {
    var result : MovementData[] = [];
    let index = 0;
    const currentTimestamp = value.getUint32(index); //important if we want timestamp relative to start#
    index += 4;
    const numberofSamples = value.getUint8(index);
    index += 1;
    let accData: MovementData[] = [];
    let gyrData: MovementData[] = [];
    let magData: MovementData[] = [];
    if (!this.startingTime) {
      this.startingTime = Date.now() - currentTimestamp;
    }
    for(let i=0; i<numberofSamples*3; i++){
      let sampleNumber = i%numberofSamples;
      const timestamp = (currentTimestamp-this.lastTimestamp)*sampleNumber/numberofSamples+this.lastTimestamp+this.startingTime;
      const x_value = value.getFloat32(index,/*littleEndian=*/true);
      index += 4;
      const y_value = value.getFloat32(index,/*littleEndian=*/true);
      index += 4;
      const z_value = value.getFloat32(index,/*littleEndian=*/true);
      index += 4;
      const data: MovementData = {
        timestamp,
        x_value,
        y_value,
        z_value
      };
      if(i<numberofSamples) {
        accData.push(data);
      }
      else if(i<numberofSamples*2) {
        gyrData.push(data);
      }
      else {
        magData.push(data);
      }
    }
    this.lastTimestamp=currentTimestamp;
    return [accData, gyrData, magData];
  }

  /**
   * Computes the absolute timestamp from a given relative timestamp.
   * 
   * This function is stateful!
   * It assumes that the first relative timestamp's absolute timestamp is `Date.now()`.
   * @param relativeTimestamp Relative timestamp from sensor.
   * @returns Absolute timestamp in local date time.
   */
  private computeAbsoluteTimestamp(relativeTimestamp: number) {
    // Set `firstRelativeTimestamp` and `firstAbsoluteTimestamp` to compute `relativeTimeOffset` if not yet done.
    if (this.relativeTimeOffset === undefined) {
      console.log(`[ECG PARSER] Computing relative offset...`);
      const now = Date.now();
      console.log(`[ECG PARSER] First absolute timestamp:`, now, new Date(now));
      this.relativeTimeOffset = now - relativeTimestamp;
      console.log(`[ECG PARSER] First relative time offset:`, this.relativeTimeOffset);
    } else {
      // Detect relative timestamp overflow.
      // Should happen every 32^2 ms (~ 49.7 days) after starting the sensor.
      // Keep in mind that the sensor may be started many days before this program gets started!
      if (this.lastRelativeTimestamp! - relativeTimestamp > MILLISECONDS_A_DAY) {
        console.log(`[ECG PARSER] Relative timestamp overflow detected! Adjusting relative time offset...`);
        console.log(`[ECG PARSER] Last relative timestamp:`, this.lastRelativeTimestamp);
        console.log(`[ECG PARSER] Relative timestamp:`, relativeTimestamp);
        console.log(`[ECG PARSER] Old relative time offset:`, this.relativeTimeOffset);
        // Overflow detected -> Add 2^32 to the relativeTimeOffset.
        this.relativeTimeOffset! += UINT32_RANGE;
        console.log(`[ECG PARSER] New relative time offset:`, this.relativeTimeOffset);
      }
    }

    // Convert relativeTimestamp to absoluteTimestamp.
    const absoluteTimestamp = relativeTimestamp + this.relativeTimeOffset!;

    // Update last relative timestamp.
    this.lastRelativeTimestamp = relativeTimestamp;

    // Return 
    return absoluteTimestamp;
  }

  /**
   * Parses one New ECG Voltage Sample.
   * @param dataView DataView to parse value from.
   * @param index Current index in DataView.
   * @param timestamp Timestamp of sample.
   * @returns Parsed ECG Voltage sample.
   */
   private parseNewEcgVoltageSample(dataView: DataView, index: number, timestamp: number): EcgVoltageData {
    const voltage = dataView.getInt16(index, true);
    return {
      timestamp,
      voltage,
    };
  }

  /**
   * Parses one ECG Voltage Sample.
   * @param dataView DataView to parse value from.
   * @param index Current index in DataView.
   * @param timestamp Timestamp of sample.
   * @returns Parsed ECG Voltage sample.
   */
  private parseEcgVoltageSample(dataView: DataView, index: number, timestamp: number): EcgVoltageData {
    const voltage = dataView.getInt32(index, true);
    return {
      timestamp,
      voltage,
    };
  }

  public parseNewEcgVoltageData(dataView: DataView): EcgVoltageData[] {
    // Create index counter to iterate over received `dataView` object.
    let index = 0;

    // Parse relative timestamp and convert it to absolute timestamp.
    const relativeTimestamp = dataView.getUint32(index, true);
    const absoluteTimestamp = this.computeAbsoluteTimestamp(relativeTimestamp);
    index += 4;

    // Parse number of samples.
    const remainingBytes = dataView.byteLength - 4;
    const remainingNumberOfSamples = Math.floor(remainingBytes / 2);
    const numberOfSamples = remainingNumberOfSamples;
    // console.log(`Sample Sequence received: ${numberOfSamples}. Remaining: ${remainingNumberOfSamples}, Defined: ${definedNumberOfSamples}`);

    // Parse ECG samples.
    const samples: EcgVoltageData[] = [];
    const sampleTime = 1000 / this.samplingRate;
    for (let i = 0; i < numberOfSamples; i++) {
      // Compute timestamp of new sample.
      const t = Math.floor(absoluteTimestamp + ((i - numberOfSamples + 1) * sampleTime));

      // Parse sample and add it to list of samples.
      const sample = this.parseNewEcgVoltageSample(dataView, index, t);
      if (ecgWriter !== undefined) {
        ecgWriter.write(`${sample.timestamp},${sample.voltage},${i},${relativeTimestamp}\n`);
      }
      samples.push(sample);
      index += 2;

      // Update statistics.
      this.voltageSum += sample.voltage;
      this.numberOfVoltages++;
    }

    return samples;
  }

  /**
   * Parses an ECG Voltage Gatt Characteristics payload.
   * @param dataView GATT DataView of an ECG Voltage sample sequence.
   * @returns Decoded ECG Voltage Data objects with absolute timestamps.
   */
  public parseEcgVoltageData(dataView: DataView): EcgVoltageData[] {
    // Create index counter to iterate over received `dataView` object.
    let index = 0;

    // Parse relative timestamp and convert it to absolute timestamp.
    const relativeTimestamp = dataView.getUint32(index);
    const absoluteTimestamp = this.computeAbsoluteTimestamp(relativeTimestamp);
    index += 4;

    // Parse number of samples.
    const remainingBytes = dataView.byteLength - 5;
    const remainingNumberOfSamples = Math.floor(remainingBytes / 4);
    const definedNumberOfSamples = dataView.getUint8(index);
    const numberOfSamples = Math.min(remainingNumberOfSamples, definedNumberOfSamples);
    // console.log(`Sample Sequence received: ${numberOfSamples}. Remaining: ${remainingNumberOfSamples}, Defined: ${definedNumberOfSamples}`);
    index += 1;

    // Parse ECG samples.
    const samples: EcgVoltageData[] = [];
    const sampleTime = 1000 / this.samplingRate;
    for (let i = 0; i < numberOfSamples; i++) {
      // Compute timestamp of new sample.
      const t = Math.floor(absoluteTimestamp + ((i - numberOfSamples + 1) * sampleTime));

      // Parse sample and add it to list of samples.
      const sample = this.parseEcgVoltageSample(dataView, index, t);
      if (ecgWriter !== undefined) {
        ecgWriter.write(`${sample.timestamp},${sample.voltage},${i},${relativeTimestamp}\n`);
      }
      samples.push(sample);
      index += 4;

      // Update statistics.
      this.voltageSum += sample.voltage;
      this.numberOfVoltages++;
    }

    return samples;
  }

  private lastTrustworthyTime?: number = undefined;
  private lastStableRRInterval?: number = undefined;
  private readonly trustworthyFactor : number = 1.5;

  /**
   * Uses the ECG Voltage Data to detect heartbeats and return EcgData
   * @param vData    EcgVoltageData that might show a heartbeat
   * @return false, if no new heartbeat was detected, EcgData otherwise
   */
  public calculateRRfromVoltage(vData: EcgVoltageData): boolean | EcgData {
    // Normalize timestamp of new ECG data.
    vData.timestamp = Math.floor(vData.timestamp);
    const trustworthyThreshold = (this.maxVoltage === undefined || this.lastR === undefined) ? MAX_TRUSTWORTHY_VOLTAGE : Math.min(MAX_TRUSTWORTHY_VOLTAGE, this.maxVoltage * this.trustworthyFactor);
    if (this.lastTrustworthyTime === undefined) {
      if (Math.abs(vData.voltage) > trustworthyThreshold) {
        console.warn(`Voltage value of ${vData.voltage} exceeded maximum trustworthy voltage value of ${trustworthyThreshold}! Omitting value.`);
        this.lastTrustworthyTime = vData.timestamp;
        this.inR = false;
        this.lastEcg = undefined;
        this.lastLastEcg = undefined;
        this.lastR = undefined;
        this.voltagePeaks.length = 0;
        this.maxVoltage = undefined;
        this.firstEcgTime = vData.timestamp - this.evaluationSpan * 0.75;
        return false;
      }
    } else {
      if (Math.abs(vData.voltage) > trustworthyThreshold) {
        this.lastTrustworthyTime = vData.timestamp;
        // console.log(`Extending reputation time`);
      }
      const reputationTime = this.lastStableRRInterval === undefined ? this.minReputationTime : Math.max(this.minReputationTime, this.lastStableRRInterval * 2);
      // console.log(`Reputation time: ${reputationTime}\nCurrent Time: ${vData.timestamp - this.lastTrustworthyTime}\nLast Stable RR: ${this.lastStableRRInterval}`);
      if (vData.timestamp - this.lastTrustworthyTime > reputationTime) {
        this.lastTrustworthyTime = undefined;
        // console.log(`Stopping reputation time`);
      }
      return false;
    }
    // Set timestamp of first received ECG voltage data if not set before.
    if (this.firstEcgTime === undefined) {
      this.firstEcgTime = vData.timestamp;
    }
    // Remove old `this.maxValues` and update `this.maxVoltage`.
    {
      let maxValuesChanged = false;
      // Remove all maxima older then `evaluationSpan` milliseconds before `vData.timestamp`.
      const omitThreshold = vData.timestamp - this.evaluationSpan;
      while ((this.voltagePeaks.length > 0) && (this.voltagePeaks[0].timestamp < omitThreshold)) {
        let val = this.voltagePeaks.shift();
        // Mark to update this.maxVoltage if removed value was maximum.
        if (val.voltage >= this.maxVoltage) {
          maxValuesChanged = true;
        }
      }
      // Search new maximum if maximum was removed.
      if (maxValuesChanged) {
        let max = -Infinity;
        // Iterate over each maxValue v and update max if larger.
        for (let v of this.voltagePeaks) {
          if (v.voltage > max) {
            max = v.voltage;
          }
        }
        if (max === -Infinity) {
          // Set maxVoltage to undefined if no value in this.maxValues.
          // console.log(`Max Voltage removed. Previous: ${this.maxVoltage}`, this.voltagePeaks);
          this.maxVoltage = undefined;
        } else {
          // Update maxVoltage.
          // console.log(`New Max Voltage: ${max}\nPrevious Max Voltage: ${this.maxVoltage}`, this.voltagePeaks);
          this.maxVoltage = max;
        }
      }
    }
    // Indicates whether the [lastEcg] was a peak.
    let lastVoltageWasPeak = false;
    // Detect new peak.
    if (this.lastEcg !== undefined && this.lastLastEcg !== undefined) {
      // Check whether [lastEcg]'s voltage value was a peak.
      if (this.lastEcg.voltage > 0 && this.lastEcg.voltage > vData.voltage && this.lastLastEcg.voltage < this.lastEcg.voltage) {
        lastVoltageWasPeak = true;
        // New voltage < last voltage -> last voltage was peak.
        this.voltagePeaks.push(this.lastEcg);
        // Update this.maxVoltage if found voltage is new maximum.
        if ((this.maxVoltage === undefined) || (vData.voltage > this.maxVoltage)) {
          // console.log(`New Max Voltage: ${vData.voltage}\nPrevious Max Voltage: ${this.maxVoltage}\nIncreased!`, this.voltagePeaks);
          this.maxVoltage = vData.voltage;
        }
      }
    }

    // Mark current value as last value.
    this.lastLastEcg = this.lastEcg;
    this.lastEcg = vData;

    // Do not detect R peaks, if [evaluationSpan] since first received ECG data was not exceeded.
    if (this.firstEcgTime + this.evaluationSpan > vData.timestamp) {
      // console.log(`omitting RR\n${this.lastTrustworthyTime}\n`);
      return false;
    }

    // Do not detect new R peaks, if no max voltage (= no max value in this.maxValues) exists.
    if (this.maxVoltage === undefined) {
      // console.log('No Max voltage');
      return false;
    }

    // Do not detect new R peaks, if last R was less then this.minROffset ago.
    if ((this.lastR !== undefined) && ((vData.timestamp - this.lastR) <= this.minROffset)) {
      // console.log('last R was less then minROffset ago');
      return false;
    }

    // Compute current threshold to detect R values.
    const rThreshold = this.maxVoltage * this.peakFactor;

    let rPeakValue: EcgVoltageData = undefined;
    if (this.inR) {
      // In R peak -> search for new maxima and add them to currentRMaxValues.
      if (lastVoltageWasPeak) {
        this.currentRMaxValues.push(this.lastLastEcg);
      }
      // In R peak -> search for value below rThreshold.
      if (vData.voltage < rThreshold) {
        // R-peak end detected.
        // console.log('leaving R')
        this.inR = false;
        // Find R peak.
        let maxVoltage = -Infinity;
        for (const v of this.currentRMaxValues) {
          if (v.voltage > maxVoltage) {
            rPeakValue = v;
            maxVoltage = v.voltage;
          }
        }
        // Clear in-R maxima.
        this.currentRMaxValues.length = 0;
      }
    } else {
      // Out of R peak -> search for value above rThreshold.
      if (vData.voltage > rThreshold) {
        // console.log('entering R')
        // R-peak start detected.
        this.inR = true;
      }
    }

    // Return false if no new RR interval detected.
    if (rPeakValue === undefined) {
      // console.log(`No peak: ${this.maxVoltage}`);
      return false;
    }

    // Compute RR-Interval.
    let rrInt: number = undefined;
    if (this.lastR !== undefined) {
      rrInt = rPeakValue.timestamp - this.lastR;
    }
    this.lastR = rPeakValue.timestamp;

    // Ensure that RR interval is known.
    if (rrInt === undefined) {
      // console.log('rr interval undefined')
      return false;
    }

    // Check if RR interval is legit.
    if (rrInt > this.maxROffset) {
      // console.log('rr interval > maxROffset')
      return false;
    }

    if (rrWriter !== undefined) {
      rrWriter.write(`${rPeakValue.timestamp},${rrInt}\n`);
    }

    // Update HRV values.
    this.hrv.addNNValue(rrInt, rPeakValue.timestamp);

    if (rrInt <= 2000) {
      this.lastStableRRInterval = rrInt;
    }

    // Generate new ECG Data.
    const data: EcgData = {
      heartRate: 60000 / rrInt,
      t: rPeakValue.timestamp,
      rrInterval: rrInt,
      sampleSize: this.hrv.sampleSize,
      meanHr: this.hrv.meanHr,
      sdnn: this.hrv.sdnn,
      rmssd: this.hrv.rmssd,
      nn50: this.hrv.nn50,
      pnn50: this.hrv.pnn50,
      vlf: this.hrv.vlf,
      lf: this.hrv.lf,
      hf: this.hrv.hf,
      lfHfRatio: this.hrv.lfHfRatio,
      consistent: (rrInt && this.hrv.consistent)
    };
    return data;
  }

  /**
   * Parses a GATT DataView using battery_level decoding
   * @param value    GATT Dataview
   * @returns        Decoded battery information from the GATT DataView
   */
  public parseBatterylevel(value: DataView): EdaData {
    const result: EdaData = {
      t: Date.now(),
      edaValue: value.getUint8(0)
    };
    return result;
  }
}
