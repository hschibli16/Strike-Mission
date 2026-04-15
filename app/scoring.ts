export function scoreSurfSpot(params: {
  waveHeight: string | null;
  wavePeriod: string | null;
  bestMonths: number[];
  flightPrice: number;
}): number {
  const currentMonth = new Date().getMonth() + 1;
  const waveH = parseFloat(params.waveHeight ?? '0') || 0;
  const period = parseFloat(params.wavePeriod ?? '0') || 0;
  const conditionsScore = Math.min(waveH / 3, 1) * 30;
  const periodScore = Math.min(period / 14, 1) * 10;
  const valueScore = (1 - params.flightPrice / 1200) * 20;
  const seasonScore = params.bestMonths.includes(currentMonth) ? 10 : 0;
  return Math.round(conditionsScore + periodScore + valueScore + seasonScore);
}

export function scoreSkiSpot(params: {
  totalSnowCm: number;
  bestMonths: number[];
  flightPrice: number;
}): number {
  const currentMonth = new Date().getMonth() + 1;
  const snowScore = Math.min(params.totalSnowCm / 50, 1) * 40;
  const valueScore = (1 - params.flightPrice / 800) * 20;
  const seasonScore = params.bestMonths.includes(currentMonth) ? 10 : 0;
  return Math.round(snowScore + valueScore + seasonScore);
}

export function getStrikeLabel(score: number): { label: string; color: string } {
  if (score >= 60) return { label: 'FIRING', color: '#e8823a' };
  if (score >= 40) return { label: 'GOOD', color: '#c8a882' };
  if (score >= 20) return { label: 'FAIR', color: '#8a7a6a' };
  return { label: 'QUIET', color: '#4a4540' };
}
