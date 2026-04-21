import { BuoyObservation } from './buoy';

export interface TransformInput {
  buoy: BuoyObservation;
  refractionCoefficient: number;
  minUsefulPeriod: number;
}

export interface TransformResult {
  estimatedSurfHeightFt: number;
  shoalingCoefficient: number;
  refractionCoefficient: number;
  periodFactor: number;
  confidence: 'high' | 'moderate' | 'low';
  confidenceReason: string;
}

export function transformBuoyToSurf(input: TransformInput): TransformResult | null {
  const { buoy, refractionCoefficient, minUsefulPeriod } = input;

  // Step 1 — Validate
  if (buoy.waveHeightFt === null || buoy.waveHeightFt === undefined) return null;
  if (buoy.periodS === null || buoy.periodS === undefined) return null;
  if (buoy.ageMinutes > 360) return null;

  const period = buoy.periodS;

  // Step 2 — Shoaling coefficient
  let shoalingCoefficient: number;
  if (period < 6) {
    shoalingCoefficient = 1.0;
  } else if (period < 9) {
    shoalingCoefficient = 1.15;
  } else if (period < 12) {
    shoalingCoefficient = 1.3;
  } else if (period < 16) {
    shoalingCoefficient = 1.4;
  } else {
    shoalingCoefficient = 1.5;
  }

  // Step 3 — Period factor
  let periodFactor: number;
  if (period < minUsefulPeriod) {
    periodFactor = 0.7;
  } else if (period < minUsefulPeriod + 3) {
    periodFactor = 0.9;
  } else {
    periodFactor = 1.0;
  }

  // Step 4 — Apply formula
  const estimatedSurfHeightFt = Math.round(
    buoy.waveHeightFt * shoalingCoefficient * refractionCoefficient * periodFactor * 10
  ) / 10;

  // Step 5 — Confidence
  let confidence: 'high' | 'moderate' | 'low';
  let confidenceReason: string;

  if (period >= minUsefulPeriod + 3 && buoy.ageMinutes < 90) {
    confidence = 'high';
    confidenceReason = 'Clean groundswell, fresh buoy data, well-calibrated spot';
  } else if (period < minUsefulPeriod) {
    confidence = 'low';
    confidenceReason = 'Short-period wind chop — transformation less reliable';
  } else if (buoy.ageMinutes > 180) {
    confidence = 'low';
    confidenceReason = 'Buoy data is hours old — conditions may have shifted';
  } else {
    confidence = 'moderate';
    confidenceReason = 'Reasonable groundswell; transformation approximated';
  }

  return {
    estimatedSurfHeightFt,
    shoalingCoefficient,
    refractionCoefficient,
    periodFactor,
    confidence,
    confidenceReason,
  };
}
