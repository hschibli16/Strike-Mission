import { Spot } from '../../spots';
import { fetchBuoyData } from '../buoy';
import { fetchTideData, getTideState } from '../tide';
import { transformBuoyToSurf } from '../surf-transform';
import { getSurfConditions } from './surf-conditions';

export type DataSource =
  | 'buoy_direct'        // spot has a real buoy assigned, we read it live
  | 'buoy_nearest'       // no direct buoy, we use the nearest station within radius (future)
  | 'model_only';        // no buoy in range, we use model consensus only

export type ConditionsConfidence = 'high' | 'medium' | 'low';

export type Verdict = 'FIRING' | 'GOOD' | 'FAIR' | 'SMALL' | 'BLOWN_OUT' | 'FLAT' | 'NO_DATA';

export interface UnifiedConditions {
  spot: Spot;

  // Core readings — every spot has these, sourced from best available data
  waveHeightFt: number | null;
  periodS: number | null;
  swellDirectionDeg: number | null;
  windSpeedMph: number | null;
  windDirectionDeg: number | null;
  windDirectionScore: number;      // 0-100, higher = more offshore
  waterTempF: number | null;

  // Derived
  estimatedBreakHeightFt: number | null;
  tideHeightFt: number | null;
  tideState: 'rising' | 'falling' | 'high' | 'low' | 'unknown';

  // Meta
  dataSource: DataSource;
  confidence: ConditionsConfidence;
  confidenceReason: string;
  buoyDistanceKm: number | null;
  observedAt: Date | null;
  ageMinutes: number | null;

  // Ranking
  score: number;
  verdict: Verdict;
}

// When a spot lacks hand-entered calibration, infer reasonable defaults.
// Conservative values — better to underestimate than oversell.
export function getEffectiveCalibration(spot: Spot): {
  refractionCoefficient: number;
  minUsefulPeriod: number;
} {
  if (typeof spot.refractionCoefficient === 'number' && typeof spot.minUsefulPeriod === 'number') {
    return {
      refractionCoefficient: spot.refractionCoefficient,
      minUsefulPeriod: spot.minUsefulPeriod,
    };
  }
  return {
    refractionCoefficient: 1.2,   // neutral default for uncalibrated spots
    minUsefulPeriod: 8,
  };
}

export async function getUnifiedConditions(spot: Spot): Promise<UnifiedConditions> {
  if (spot.type !== 'surf') {
    throw new Error(`getUnifiedConditions is surf-only; got ${spot.type}`);
  }

  const [buoyData, modelConditions, tideData] = await Promise.all([
    spot.buoyId
      ? fetchBuoyData(spot.buoyId).catch(err => { console.warn(`[unified:${spot.slug}] buoy failed:`, err); return null; })
      : Promise.resolve(null),
    getSurfConditions({
      lat: spot.lat,
      lon: spot.lon,
      idealSwellDirection: spot.idealSwellDirection ?? undefined,
      idealWindDirection: spot.idealWindDirection ?? undefined,
      bestMonths: spot.bestMonths,
      flightPrice: spot.flightPrice ?? 0,
      regionSlug: spot.regionSlug,
    }).catch(err => { console.warn(`[unified:${spot.slug}] model failed:`, err); return null; }),
    spot.tideStationId
      ? fetchTideData(spot.tideStationId).catch(err => { console.warn(`[unified:${spot.slug}] tide failed:`, err); return null; })
      : Promise.resolve(null),
  ]);

  const hasBuoy = buoyData !== null && buoyData.waveHeightFt !== null;
  const dataSource: DataSource = hasBuoy ? 'buoy_direct' : 'model_only';

  // Buoy readings (numbers). Model readings are strings — parse them.
  const modelWaveHeightFt = modelConditions?.waveHeightFt != null ? parseFloat(modelConditions.waveHeightFt) : null;
  const modelPeriod = modelConditions?.wavePeriod != null ? parseFloat(modelConditions.wavePeriod) : null;
  const modelSwellDirDeg = modelConditions?.primarySwell?.directionDegrees != null
    ? parseFloat(modelConditions.primarySwell.directionDegrees)
    : null;
  const modelWindSpeedMph = modelConditions?.windSpeedMph != null ? parseFloat(modelConditions.windSpeedMph) : null;
  const modelWindDirDeg = modelConditions?.windDirection != null ? parseFloat(modelConditions.windDirection) : null;
  const modelSeaTempF = modelConditions?.seaTempF != null ? parseFloat(modelConditions.seaTempF) : null;

  const waveHeightFt = buoyData?.waveHeightFt ?? modelWaveHeightFt;
  const periodS = buoyData?.periodS ?? modelPeriod;
  const swellDirectionDeg = buoyData?.directionDeg ?? modelSwellDirDeg;
  const windSpeedMph = modelWindSpeedMph;
  const windDirectionDeg = modelWindDirDeg;
  const windDirectionScore = modelConditions?.windDirectionScore ?? 50;

  const waterTempF = buoyData?.waterTempC != null
    ? (buoyData.waterTempC * 9 / 5) + 32
    : modelSeaTempF;

  // Estimate break height
  let estimatedBreakHeightFt: number | null = null;
  if (buoyData && buoyData.waveHeightFt != null && buoyData.periodS != null) {
    const calibration = getEffectiveCalibration(spot);
    const estimate = transformBuoyToSurf({
      buoy: buoyData,
      refractionCoefficient: calibration.refractionCoefficient,
      minUsefulPeriod: calibration.minUsefulPeriod,
    });
    if (estimate) estimatedBreakHeightFt = estimate.estimatedSurfHeightFt;
  }
  if (estimatedBreakHeightFt === null) {
    estimatedBreakHeightFt = waveHeightFt;
  }

  // Tide
  const tideHeightFt = tideData?.currentHeightFt ?? null;
  let tideState: UnifiedConditions['tideState'] = 'unknown';
  if (tideData) {
    const raw = getTideState(tideData);
    if (raw === 'LOW') tideState = 'low';
    else if (raw === 'HIGH') tideState = 'high';
    else if (raw === 'MID_RISING') tideState = 'rising';
    else if (raw === 'MID_FALLING') tideState = 'falling';
  }

  // Confidence
  const buoyAge = buoyData?.ageMinutes ?? null;
  const hasHandCalibration = typeof spot.refractionCoefficient === 'number' && typeof spot.minUsefulPeriod === 'number';
  let confidence: ConditionsConfidence = 'low';
  let confidenceReason = 'Model-only forecast, no buoy nearby';

  if (hasBuoy && hasHandCalibration && buoyAge !== null && buoyAge < 90) {
    confidence = 'high';
    confidenceReason = 'Fresh buoy data + calibrated transformation';
  } else if (hasBuoy && buoyAge !== null && buoyAge < 180) {
    confidence = 'medium';
    confidenceReason = hasHandCalibration
      ? 'Buoy data slightly stale, calibration known'
      : 'Buoy data fresh but spot uses default calibration';
  } else if (hasBuoy) {
    confidence = 'low';
    confidenceReason = 'Buoy data is stale (>3hr old)';
  }

  let observedAt: Date | null = buoyData?.observedAt ?? null;
  let ageMinutes: number | null = buoyData?.ageMinutes ?? null;
  if (!observedAt && modelConditions) {
    observedAt = new Date();
    ageMinutes = 0;
  }

  // Scoring
  const height = estimatedBreakHeightFt ?? 0;
  const period = periodS ?? 0;
  const wind = windSpeedMph ?? 0;

  // Period multiplier — short-period swell is wind chop, long-period is groundswell.
  let periodMultiplier: number;
  if (period >= 14) periodMultiplier = 1.0;        // solid groundswell
  else if (period >= 11) periodMultiplier = 0.9;   // good groundswell
  else if (period >= 9) periodMultiplier = 0.7;    // mid-period, still surfable
  else if (period >= 7) periodMultiplier = 0.4;    // short-period, marginal
  else if (period >= 5) periodMultiplier = 0.2;    // wind chop
  else periodMultiplier = 0.1;                      // unrideable mush

  // Base height score, then multiply by period quality
  let heightScore = 0;
  if (height >= 10) heightScore = 60;
  else if (height >= 7) heightScore = 50;
  else if (height >= 5) heightScore = 38;
  else if (height >= 3) heightScore = 24;
  else if (height >= 2) heightScore = 12;
  else if (height >= 1) heightScore = 4;

  let score = heightScore * periodMultiplier;

  // Period bonus on top of multiplier — long-period alone adds some baseline quality
  if (period >= 15) score += 12;
  else if (period >= 12) score += 8;
  else if (period >= 10) score += 4;

  // Wind — adds or subtracts from the period-weighted base
  if (wind < 6 && windDirectionScore >= 70) score += 20;
  else if (wind < 12 && windDirectionScore >= 60) score += 12;
  else if (wind < 18 && windDirectionScore >= 50) score += 4;
  else if (wind >= 25 && windDirectionScore < 40) score -= 30;
  else if (wind >= 18 && windDirectionScore < 40) score -= 15;
  else if (wind >= 20) score -= 8;

  score = Math.round(Math.max(0, Math.min(100, score)));

  const anyReal = waveHeightFt !== null || periodS !== null || windSpeedMph !== null;
  let verdict: Verdict;
  if (!anyReal) {
    verdict = 'NO_DATA';
    score = 0;
  } else if (score >= 70) verdict = 'FIRING';
  else if (score >= 50) verdict = 'GOOD';
  else if (score >= 30) verdict = 'FAIR';
  else if (wind >= 18 && windDirectionScore < 40) verdict = 'BLOWN_OUT';
  else if (height < 2) verdict = 'FLAT';
  else verdict = 'SMALL';

  return {
    spot,
    waveHeightFt,
    periodS,
    swellDirectionDeg,
    windSpeedMph,
    windDirectionDeg,
    windDirectionScore,
    waterTempF: waterTempF ?? null,
    estimatedBreakHeightFt,
    tideHeightFt,
    tideState,
    dataSource,
    confidence,
    confidenceReason,
    buoyDistanceKm: null,
    observedAt,
    ageMinutes,
    score,
    verdict,
  };
}

export async function getUnifiedConditionsForSpots(spots: Spot[]): Promise<UnifiedConditions[]> {
  const surfSpots = spots.filter(s => s.type === 'surf');
  const results = await Promise.all(
    surfSpots.map(spot =>
      getUnifiedConditions(spot).catch(err => {
        console.warn(`[unified] failed for ${spot.slug}:`, err);
        return null;
      })
    )
  );
  return results.filter((r): r is UnifiedConditions => r !== null);
}
