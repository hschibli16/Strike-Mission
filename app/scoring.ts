function directionDifference(dir1: number, dir2: number): number {
  const diff = Math.abs(dir1 - dir2) % 360;
  return diff > 180 ? 360 - diff : diff;
}

export type StrikeLabel = { label: string; color: string; bg: string };

export function getStrikeLabel(score: number): StrikeLabel {
  if (score >= 72) return { label: 'FIRING', color: '#052e16', bg: '#4ade80' };
  if (score >= 52) return { label: 'GOOD', color: '#052e16', bg: '#86efac' };
  if (score >= 32) return { label: 'FAIR', color: '#451a03', bg: '#fbbf24' };
  if (score >= 15) return { label: 'BLOWN OUT', color: '#f0ebe0', bg: '#6b6560' };
  return { label: 'FLAT', color: '#f0ebe0', bg: '#2a2520' };
}

export function getSkiLabel(score: number): StrikeLabel {
  if (score >= 72) return { label: 'POWDER DAY', color: '#052e16', bg: '#4ade80' };
  if (score >= 52) return { label: 'GOOD SNOW', color: '#052e16', bg: '#86efac' };
  if (score >= 35) return { label: 'SKIABLE', color: '#451a03', bg: '#fbbf24' };
  if (score >= 20) return { label: 'ICY', color: '#f0ebe0', bg: '#6b6560' };
  return { label: 'BARE', color: '#f0ebe0', bg: '#2a2520' };
}

export function scoreSurfSpot(params: {
  waveHeight: string | null;
  wavePeriod: string | null;
  swellDirection: string | null;
  windDirection: string | null;
  windSpeed: string | null;
  idealSwellDirection?: number;
  idealWindDirection?: number;
  bestMonths: number[];
  flightPrice: number;
}): number {
  const currentMonth = new Date().getMonth() + 1;
  const waveH = parseFloat(params.waveHeight ?? '0') || 0;
  const period = parseFloat(params.wavePeriod ?? '0') || 0;
  const swellDir = params.swellDirection ? parseFloat(params.swellDirection) : null;
  const windDir = params.windDirection ? parseFloat(params.windDirection) : null;
  const windSpeed = params.windSpeed ? parseFloat(params.windSpeed) : null;
  const idealSwell = params.idealSwellDirection ?? null;
  const idealWind = params.idealWindDirection ?? null;

  // ── WIND QUALITY (most important factor — 30 points) ──
  // Offshore = perfect, cross-offshore = ok, onshore = terrible
  let windScore = 15; // default if no data
  if (windDir !== null && idealWind !== null) {
    const windDiff = directionDifference(windDir, idealWind);
    if (windDiff <= 22) windScore = 30;        // perfect offshore
    else if (windDiff <= 45) windScore = 24;   // light offshore
    else if (windDiff <= 67) windScore = 16;   // cross-offshore
    else if (windDiff <= 90) windScore = 10;   // cross-shore
    else if (windDiff <= 135) windScore = 4;   // cross-onshore
    else windScore = 0;                         // onshore — destroyed
  }
  // Strong onshore wind makes even offshore direction bad
  if (windSpeed !== null && windSpeed > 25 && windScore < 16) windScore = Math.max(0, windScore - 8);
  // Calm winds are a bonus even if direction is slightly off
  if (windSpeed !== null && windSpeed < 8 && windScore >= 16) windScore = Math.min(30, windScore + 4);

  // ── SWELL DIRECTION (second most important — 25 points) ──
  // Wrong swell direction means wave doesn't break at this spot
  let swellDirScore = 12; // default if no data
  if (swellDir !== null && idealSwell !== null) {
    const swellDiff = directionDifference(swellDir, idealSwell);
    if (swellDiff <= 15) swellDirScore = 25;      // perfect angle
    else if (swellDiff <= 30) swellDirScore = 20; // great angle
    else if (swellDiff <= 60) swellDirScore = 13; // workable
    else if (swellDiff <= 90) swellDirScore = 6;  // marginal
    else swellDirScore = 1;                        // wrong direction
  }

  // ── WAVE HEIGHT (20 points) ──
  // waveH is in FEET
  // Sweet spot varies by spot but generally 4-10ft is ideal
  // Too small = boring, too big = maxed out and dangerous
  let heightScore = 0;
  if (waveH >= 2 && waveH < 4) heightScore = 8;   // small but surfable
  else if (waveH >= 4 && waveH < 6) heightScore = 14; // fun size
  else if (waveH >= 6 && waveH < 9) heightScore = 20; // solid
  else if (waveH >= 9 && waveH < 14) heightScore = 18; // big — good if you can handle it
  else if (waveH >= 14) heightScore = 10;              // massive — closing out for most
  else heightScore = 0;                                 // flat

  // ── SWELL PERIOD (15 points) ──
  // Longer period = more power, better quality waves
  // Under 8s = wind swell, choppy; 12s+ = groundswell, powerful and clean
  let periodScore = 0;
  if (period >= 16) periodScore = 15;      // epic groundswell
  else if (period >= 13) periodScore = 12; // excellent
  else if (period >= 10) periodScore = 8;  // good
  else if (period >= 8) periodScore = 4;   // ok
  else periodScore = 0;                    // wind swell only

  // ── SEASON (10 points) ──
  const inSeason = params.bestMonths.includes(currentMonth);
  const seasonScore = inSeason ? 10 : 0;

  // Total out of 100
  const total = windScore + swellDirScore + heightScore + periodScore + seasonScore;
  return Math.round(total);
}

export function scoreSkiSpot(params: {
  totalSnowCm: number;
  bestMonths: number[];
  flightPrice: number;
}): number {
  const currentMonth = new Date().getMonth() + 1;
  const inSeason = params.bestMonths.includes(currentMonth);

  if (!inSeason) {
    // Out of season ski resorts should score very low
    return Math.round(Math.min(params.totalSnowCm / 50, 1) * 15);
  }

  // Fresh snow is everything in skiing
  // 0cm = thin/icy, 10cm = ok, 25cm = good, 50cm+ = epic powder day
  let snowScore = 0;
  if (params.totalSnowCm >= 50) snowScore = 55;
  else if (params.totalSnowCm >= 30) snowScore = 45;
  else if (params.totalSnowCm >= 15) snowScore = 32;
  else if (params.totalSnowCm >= 5) snowScore = 18;
  else snowScore = 5; // always some base snow at a resort in season

  const valueScore = (1 - Math.min(params.flightPrice / 800, 1)) * 25;
  const seasonScore = 20;

  return Math.round(snowScore + valueScore + seasonScore);
}
