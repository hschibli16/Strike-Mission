import { Spot } from '../spots';

export type ConfidenceTier = 'high' | 'medium' | 'low';

export interface SpotConfidence {
  tier: ConfidenceTier;
  reason: string;
}

export function getSpotConfidence(spot: Spot): SpotConfidence {
  if (spot.type === 'ski') {
    return { tier: 'high', reason: 'Snow forecasts from Open-Meteo' };
  }

  const hasBuoy = typeof spot.buoyId === 'string' && spot.buoyId.length > 0;
  const hasCalibration =
    typeof spot.refractionCoefficient === 'number' &&
    typeof spot.minUsefulPeriod === 'number';

  if (hasBuoy && hasCalibration && (spot.refractionCoefficient ?? 99) < 1.5) {
    return {
      tier: 'high',
      reason: 'Live buoy data + well-calibrated spot with moderate coastal refraction',
    };
  }

  if (hasBuoy && hasCalibration) {
    return {
      tier: 'medium',
      reason: 'Live buoy data + calibration, but complex coastal geometry increases estimate uncertainty',
    };
  }

  return {
    tier: 'low',
    reason: 'No nearby NOAA buoy — forecast relies on model data only, which is unreliable for break-specific conditions',
  };
}
