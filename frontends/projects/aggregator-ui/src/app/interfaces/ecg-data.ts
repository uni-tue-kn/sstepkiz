
export interface EcgData {
  // Time of the measurement
  t: number;

  // Validation of the HRV sample
  sampleSize: number;
  consistent: boolean;

  // General Gatt Data
  heartRate: number;
  rrInterval: number;

  // HRV Time Domain Data
  meanHr: number;
  sdnn: number;
  rmssd: number;
  nn50: number;
  pnn50: number;

  // Frequency Domain Data
  vlf: number;
  lf: number;
  hf: number;
  lfHfRatio: number;
}

// Data send from the Movesense Ecg Device via Gatt
export interface EcgGattData {
  heartRate: number;
  contactDetected: boolean;
  energyExpended: number;
  rrInterval: number;
}

// HRV time dependent data
export interface HrvTimeDomain {
  meanHr: number;
  sdnn: number;
  rmssd: number;
  nn50: number;
  pnn50: number;
}

// Hrv frequency analysis data
export interface HrvFreqDomain {
  vlf: number;
  lf: number;
  hf: number;
  lfHfRatio: number;
}
