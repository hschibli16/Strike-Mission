function directionDifference(dir1: number, dir2: number): number {
  const diff = Math.abs(dir1 - dir2) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function directionQuality(actualDir: number | null, idealDir: number | null): number {
  if (!actualDir || !idealDir) return 0.7;
  const diff = directionDifference(actualDir, idealDir);
  if (diff <= 20) return 1.0;
  if (diff <= 45) return 0.85;
  if (diff <= 90) return 0.6;
  if (diff <= 135) return 0.3;
  return 0.1;
}

function windQuality(windDir: number | null, idealWindDir: number | null, windSpeed: number | null): number {
  if (!windDir || !idealWindDir) return 0.7;
  const diff = directionDifference(windDir, idealWindDir);
  const speed = windSpeed ?? 0;
  let score = diff <= 45 ? 1.0 : diff <= 90 ? 0.7 : diff <= 135 ? 0.4 : 0.1;
  if (speed > 25) score *= 0.5;
  if (speed > 15 && diff > 90) score *= 0.7;
  return score;
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

  const swellQuality = directionQuality(swellDir, params.idealSwellDirection ?? null);
  const wQuality = windQuality(windDir, params.idealWindDirection ?? null, windSpeed);

  const heightScore = Math.min(waveH / 8, 1) * 25;
  const periodScore = Math.min(period / 14, 1) * 15;
  const directionScore = swellQuality * 20;
  const windScore = wQuality * 15;
  const valueScore = (1 - params.flightPrice / 1200) * 15;
  const seasonScore = params.bestMonths.includes(currentMonth) ? 10 : 0;

  return Math.round(heightScore + periodScore + directionScore + windScore + valueScore + seasonScore);
}

export function scoreSkiSpot(params: {
  totalSnowCm: number;
  bestMonths: number[];
  flightPrice: number;
}): number {
  const currentMonth = new Date().getMonth() + 1;
  const snowScore = Math.min(params.totalSnowCm / 50, 1) * 50;
  const valueScore = (1 - params.flightPrice / 800) * 20;
  const seasonScore = params.bestMonths.includes(currentMonth) ? 10 : 0;
  return Math.round(snowScore + valueScore + seasonScore);
}

export function getStrikeLabel(score: number): { label: string; color: string } {
  if (score >= 70) return { label: 'FIRING', color: '#e8823a' };
  if (score >= 50) return { label: 'GOOD', color: '#c8a882' };
  if (score >= 30) return { label: 'FAIR', color: '#8a7a6a' };
  return { label: 'QUIET', color: '#4a4540' };
}
