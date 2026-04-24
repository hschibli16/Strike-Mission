import type { SurfConditions, DayOutlook, SwellEvent } from './types';

function degreesToCardinal(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

function directionDiff(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function swellDirectionScore(actual: number | null, ideal: number | null): number {
  if (actual === null || ideal === null) return 60;
  const diff = directionDiff(actual, ideal);
  if (diff <= 15) return 100;
  if (diff <= 30) return 85;
  if (diff <= 45) return 70;
  if (diff <= 60) return 55;
  if (diff <= 90) return 35;
  if (diff <= 120) return 15;
  return 5;
}

function windDirectionScore(actual: number | null, ideal: number | null, speedMph: number | null): number {
  if (actual === null || ideal === null) return 60;
  const diff = directionDiff(actual, ideal);
  const speed = speedMph ?? 0;
  let score = 0;
  if (diff <= 22) score = 100;
  else if (diff <= 45) score = 85;
  else if (diff <= 67) score = 65;
  else if (diff <= 90) score = 45;
  else if (diff <= 135) score = 20;
  else score = 5;
  // Calm winds are a bonus regardless of direction
  if (speed < 5) score = Math.min(100, score + 15);
  // Very strong winds penalize even good direction
  if (speed > 30) score = Math.max(0, score - 30);
  else if (speed > 20) score = Math.max(0, score - 15);
  return score;
}

function classifySwellQuality(periodSeconds: number | null): 'groundswell' | 'windswell' | 'mixed' | 'unknown' {
  if (periodSeconds === null) return 'unknown';
  if (periodSeconds >= 14) return 'groundswell';
  if (periodSeconds >= 10) return 'mixed';
  return 'windswell';
}

function wetsuitRecommendation(seaTempC: number): string {
  if (seaTempC < 10) return '6/5mm + boots + gloves + hood';
  if (seaTempC < 14) return '5/4mm + boots + gloves + hood';
  if (seaTempC < 17) return '4/3mm wetsuit';
  if (seaTempC < 20) return '3/2mm wetsuit';
  if (seaTempC < 24) return 'Spring suit or 2mm shorty';
  return 'Boardshorts';
}

export function generateSurfVerdict(params: {
  waveHeightFt: number | null;
  period: number | null;
  swellDirScore: number;
  windDirScore: number;
  windSpeed: number | null;
  swellQuality: string;
  score: number;
  isInSeason: boolean;
  overrideHeightFt?: number | null;
}): string {
  const { period, swellDirScore, windDirScore, windSpeed, swellQuality, score, isInSeason, overrideHeightFt } = params;
  const waveHeightFt = overrideHeightFt ?? params.waveHeightFt;

  if (!waveHeightFt || waveHeightFt < 1) {
    return 'Flat. Not worth the trip right now — check back when a swell is on the way.';
  }

  const parts: string[] = [];

  // Size description
  if (waveHeightFt >= 12) parts.push(`Massive ${waveHeightFt.toFixed(0)}ft swell — serious conditions for experienced surfers only`);
  else if (waveHeightFt >= 8) parts.push(`Solid ${waveHeightFt.toFixed(0)}ft swell`);
  else if (waveHeightFt >= 5) parts.push(`Good ${waveHeightFt.toFixed(0)}ft waves`);
  else if (waveHeightFt >= 3) parts.push(`${waveHeightFt.toFixed(0)}ft waves`);
  else parts.push(`Small ${waveHeightFt.toFixed(1)}ft surf`);

  // Period quality
  if (period && period >= 16) parts.push(`with exceptional ${period.toFixed(0)}s groundswell period`);
  else if (period && period >= 13) parts.push(`with solid ${period.toFixed(0)}s groundswell`);
  else if (period && period >= 10) parts.push(`with ${period.toFixed(0)}s mixed swell`);
  else if (period && period < 10) parts.push(`but short ${period.toFixed(0)}s period indicates wind swell, expect choppy conditions`);

  // Swell direction
  if (swellDirScore >= 85) parts.push('hitting at the ideal angle');
  else if (swellDirScore >= 60) parts.push('from a workable direction');
  else if (swellDirScore >= 35) parts.push('but swell direction is marginal for this spot');
  else parts.push('swell direction is wrong for this spot, expect poor shape');

  // Wind conditions
  const speedRounded = typeof windSpeed === 'number' && !isNaN(windSpeed) ? Math.round(windSpeed) : null;

  if (windDirScore >= 85) {
    if (speedRounded !== null && speedRounded >= 1) {
      parts.push(`Clean ${speedRounded}mph offshore winds grooming the surface`);
    } else if (speedRounded === 0) {
      parts.push('Glassy conditions with no wind');
    } else {
      parts.push('Clean offshore winds grooming the surface');
    }
  } else if (windDirScore >= 65) {
    parts.push('light cross-shore winds, still manageable');
  } else if (windDirScore >= 40) {
    parts.push('cross-onshore wind affecting quality');
  } else {
    if (speedRounded !== null && speedRounded >= 1) {
      parts.push(`${speedRounded}mph onshore wind roughing up the surface`);
    } else {
      parts.push('Onshore wind roughing up the surface');
    }
  }

  if (!isInSeason) {
    parts.push('Note: this is outside the peak season for this spot');
  }

  // Wind severity override: rewrite opener and reorder when wind is destroying conditions
  const speedVal = windSpeed ?? 0;
  const isSevereWind = speedVal >= 20 && windDirScore < 50;
  const isModerateWind = !isSevereWind && ((speedVal >= 15 && windDirScore < 50) || speedVal >= 25);

  if (isSevereWind && waveHeightFt >= 3) {
    // Replace the wave-height opener with a wind-led neutral/negative one
    const heightStr = waveHeightFt >= 3 ? `${waveHeightFt.toFixed(0)}ft` : `${waveHeightFt.toFixed(1)}ft`;
    const sizeWord = waveHeightFt >= 8 ? 'swell' : 'waves';
    parts[0] = `Wind-ruined ${heightStr} ${sizeWord}`;

    // Move the wind fragment (last before season note) to index 1
    const seasonIdx = parts.findIndex(p => p.startsWith('Note:'));
    const windIdx = seasonIdx > 0 ? seasonIdx - 1 : parts.length - 1;
    if (windIdx > 1) {
      const windFrag = parts.splice(windIdx, 1)[0];
      parts.splice(1, 0, windFrag);
    }
  } else if (isModerateWind && waveHeightFt >= 3) {
    // Soften the opener adjective
    parts[0] = parts[0]
      .replace(/^Good /, 'Decent ')
      .replace(/^Solid /, 'Decent ')
      .replace(/^Massive /, 'Large but wind-affected ')
      .replace(/^Pumping /, 'Decent ');
  }

  return parts.map(p => p.replace(/[\s.—]+$/, '')).join(' — ');
}

function getPrimaryMarineModel(regionSlug: string | undefined): 'icon' | 'gfswave' | 'ecmwf_wam' {
  const usCoastRegions = [
    'hawaii',
    'pacific-northwest-california-coast',
    'atlantic-canada-new-england',
    'us-mid-atlantic-southeast',
    'caribbean-islands',
    'baja-mexico-pacific',
    'central-america-pacific',
    'south-america-pacific',
    'atlantic-south-america',
  ];
  if (regionSlug && usCoastRegions.includes(regionSlug)) return 'gfswave';

  const europeRegions = [
    'atlantic-europe',
    'north-atlantic-arctic',
    'west-african-atlantic',
  ];
  if (regionSlug && europeRegions.includes(regionSlug)) return 'icon';

  return 'gfswave';
}

export async function getSurfConditions(params: {
  lat: number;
  lon: number;
  idealSwellDirection?: number;
  idealWindDirection?: number;
  bestMonths: number[];
  flightPrice: number;
  regionSlug?: string;
}): Promise<SurfConditions> {
  const { lat, lon, idealSwellDirection, idealWindDirection, bestMonths, regionSlug } = params;
  const currentMonth = new Date().getMonth() + 1;
  const isInSeason = bestMonths.includes(currentMonth);

  try {
    // Fetch all models in parallel
    const [iconRes, ecmwfRes, gfsRes, windRes] = await Promise.all([
      fetch(
        `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,wave_peak_period,swell_wave_height,swell_wave_direction,swell_wave_period,swell_wave_peak_period,secondary_swell_wave_height,secondary_swell_wave_period,secondary_swell_wave_direction,tertiary_swell_wave_height,tertiary_swell_wave_period,tertiary_swell_wave_direction,sea_surface_temperature,wind_wave_height&daily=wave_height_max,wave_direction_dominant,wave_period_max,swell_wave_height_max,swell_wave_period_max&length_unit=imperial&wind_speed_unit=mph&forecast_days=10&timezone=auto`,
        { next: { revalidate: 1800 } }
      ),
      fetch(
        `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period&daily=wave_height_max,wave_direction_dominant,wave_period_max,swell_wave_height_max,swell_wave_period_max&length_unit=imperial&forecast_days=10&timezone=auto&models=ecmwf_wam`,
        { next: { revalidate: 1800 } }
      ),
      fetch(
        `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period&daily=wave_height_max,wave_direction_dominant,wave_period_max,swell_wave_height_max,swell_wave_period_max&length_unit=imperial&forecast_days=10&timezone=auto&models=ncep_gfswave025`,
        { next: { revalidate: 1800 } }
      ),
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=wind_speed_10m,wind_direction_10m&hourly=wind_speed_10m,wind_direction_10m&wind_speed_unit=mph&forecast_days=10&timezone=auto`,
        { next: { revalidate: 1800 } }
      ),
    ]);

    const [icon, ecmwf, gfs, wind] = await Promise.all([
      iconRes.json(), ecmwfRes.json(), gfsRes.json(), windRes.json(),
    ]);

    // Extract current values — null means no coverage, 0 means genuinely flat
    const iconWaveRaw: number | null = icon.current?.wave_height ?? null;
    const ecmwfWaveRaw: number | null = ecmwf.current?.wave_height ?? null;
    const gfsWaveRaw: number | null = gfs.current?.wave_height ?? null;

    // Determine if the ocean is genuinely flat: all non-null models are at/near 0
    const nonNullRaw = [iconWaveRaw, ecmwfWaveRaw, gfsWaveRaw].filter(v => v !== null) as number[];
    const anyModelHasWaves = nonNullRaw.some(v => v > 0.5);

    // For each model: null → no coverage; 0 when others have waves → treat as coverage gap (null); else use as-is
    function resolveModelValue(raw: number | null): number | null {
      if (raw === null) return null;
      if (raw === 0 && anyModelHasWaves) return null; // coverage gap, not genuinely flat
      return raw;
    }

    const iconWave = resolveModelValue(iconWaveRaw);
    const ecmwfWave = resolveModelValue(ecmwfWaveRaw);
    const gfsWave = resolveModelValue(gfsWaveRaw);

    // Count models that are actually responding (non-null after gap resolution)
    const respondingModelCount = [iconWave, ecmwfWave, gfsWave].filter(v => v !== null).length;

    // Weighted consensus — ECMWF is most accurate, ICON second, GFS third
    // Include non-null values even if 0 (genuinely flat ocean)
    const models: { value: number; weight: number }[] = [];
    if (iconWave !== null) models.push({ value: iconWave, weight: 0.35 });
    if (ecmwfWave !== null) models.push({ value: ecmwfWave, weight: 0.45 });
    if (gfsWave !== null) models.push({ value: gfsWave, weight: 0.20 });

    let consensusWaveHeightFt: number | null = null;
    let confidenceScore = 50;

    if (models.length > 0) {
      const totalWeight = models.reduce((sum, m) => sum + m.weight, 0);
      consensusWaveHeightFt = models.reduce((sum, m) => sum + m.value * (m.weight / totalWeight), 0);

      if (models.length >= 3) {
        const values = models.map(m => m.value);
        const maxDiff = Math.max(...values) - Math.min(...values);
        if (maxDiff < 0.5) confidenceScore = 95;
        else if (maxDiff < 1.0) confidenceScore = 80;
        else if (maxDiff < 1.5) confidenceScore = 65;
        else if (maxDiff < 2.5) confidenceScore = 45;
        else confidenceScore = 25;
      } else if (models.length === 2) {
        const diff = Math.abs(models[0].value - models[1].value);
        if (diff < 0.5) confidenceScore = 80;
        else if (diff < 1.0) confidenceScore = 65;
        else confidenceScore = 40;
      } else {
        confidenceScore = 35;
      }
    }

    const c = icon.current ?? {};
    const windCurrent = wind.current ?? {};

    const period = c.wave_peak_period ?? c.wave_period ?? null;
    const waveDir = c.wave_direction ?? null;
    const swellDir = c.swell_wave_direction ?? null;
    const windDir = windCurrent.wind_direction_10m ?? null;
    const windSpeedMph = windCurrent.wind_speed_10m ?? null;
    const seaTempC = c.sea_surface_temperature ?? null;

    const swellDirScore = swellDirectionScore(swellDir, idealSwellDirection ?? null);
    const windDirScore = windDirectionScore(windDir, idealWindDirection ?? null, windSpeedMph);
    const swellQuality = classifySwellQuality(period);

    // Overall score (0-100)
    const heightScore = consensusWaveHeightFt !== null ? Math.min(consensusWaveHeightFt / 10, 1) * 25 : 0;
    const periodScore = period !== null ? Math.min(period / 16, 1) * 15 : 0;
    const dirScore = (swellDirScore / 100) * 25;
    const windScore = (windDirScore / 100) * 25;
    const seasonScore = isInSeason ? 10 : 0;
    const overallScore = Math.round(heightScore + periodScore + dirScore + windScore + seasonScore);

    // Build 10-day outlook using the primary model for this region
    const primaryModel = getPrimaryMarineModel(regionSlug);
    const primaryResponse =
      primaryModel === 'gfswave' ? gfs :
      primaryModel === 'ecmwf_wam' ? ecmwf :
      icon;
    const daily = primaryResponse?.daily ?? {};

    // Cross-check: warn when primary model's peak diverges significantly from other models
    const iconPeak = Math.max(...(icon?.daily?.wave_height_max ?? [0]));
    const gfsPeak = Math.max(...(gfs?.daily?.wave_height_max ?? [0]));
    const ecmwfPeak = Math.max(...(ecmwf?.daily?.wave_height_max ?? [0]));
    const primaryPeak =
      primaryModel === 'gfswave' ? gfsPeak :
      primaryModel === 'ecmwf_wam' ? ecmwfPeak :
      iconPeak;
    const otherPeaks = [iconPeak, gfsPeak, ecmwfPeak].filter(p => p > 0);
    const meanOtherPeak = otherPeaks.length > 0 ? otherPeaks.reduce((a, b) => a + b, 0) / otherPeaks.length : 0;
    if (primaryPeak > 0 && meanOtherPeak > 0 && Math.abs(primaryPeak - meanOtherPeak) / primaryPeak > 0.5) {
      console.warn(`[forecast disagreement] regionSlug=${regionSlug ?? 'unknown'}: primary(${primaryModel})=${primaryPeak.toFixed(1)}ft, ensemble mean=${meanOtherPeak.toFixed(1)}ft, ICON=${iconPeak.toFixed(1)}, GFS=${gfsPeak.toFixed(1)}, ECMWF=${ecmwfPeak.toFixed(1)}`);
    }

    const outlook: DayOutlook[] = [];
    const today = new Date();

    const dayLabels = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'];

    for (let i = 0; i < Math.min(10, (daily.wave_height_max ?? []).length); i++) {
      const heightFt = daily.wave_height_max?.[i] ?? 0;
      const periodDay = daily.wave_period_max?.[i] ?? 0;
      const dirDay = daily.wave_direction_dominant?.[i] ?? 0;
      const swellHeightFt = daily.swell_wave_height_max?.[i] ?? 0;
      const swellPeriodDay = daily.swell_wave_period_max?.[i] ?? periodDay;

      const daySwellDirScore = swellDirectionScore(dirDay, idealSwellDirection ?? null);
      const dayScore = Math.round(
        Math.min(heightFt / 10, 1) * 35 +
        Math.min(periodDay / 16, 1) * 30 +
        (daySwellDirScore / 100) * 25 +
        (isInSeason ? 10 : 0)
      );

      const dayLabel =
        dayScore >= 72 ? 'FIRING' :
        dayScore >= 52 ? 'GOOD' :
        dayScore >= 32 ? 'FAIR' :
        dayScore >= 15 ? 'SMALL' : 'FLAT';

      outlook.push({
        date: new Date(today.getTime() + i * 86400000).toISOString().split('T')[0],
        dayLabel: dayLabels[i] ?? `Day ${i + 1}`,
        waveHeightFt: heightFt.toFixed(1),
        waveHeightM: (heightFt / 3.28084).toFixed(1),
        periodSeconds: periodDay.toFixed(0),
        directionDegrees: dirDay.toFixed(0),
        score: dayScore,
        label: dayLabel,
      });
    }

    const filteredOutlook = outlook.filter(d => parseFloat(d.waveHeightFt) > 0);

    // Mark best days
    const thisWeek = filteredOutlook.slice(0, 7);
    const nextWeek = filteredOutlook.slice(7, 14);
    const bestDayThisWeek = thisWeek.length > 0 ? thisWeek.reduce((best, day) => day.score > best.score ? day : best) : null;
    const bestDayNextWeek = nextWeek.length > 0 ? nextWeek.reduce((best, day) => day.score > best.score ? day : best) : null;
    if (bestDayThisWeek) bestDayThisWeek.isBestDay = true;
    if (bestDayNextWeek) bestDayNextWeek.isBestDay = true;

    // Detect swell events — days that are significantly better than the days around them
    const swellEvents: SwellEvent[] = [];
    for (let i = 0; i < filteredOutlook.length; i++) {
      const day = filteredOutlook[i];
      const heightFt = parseFloat(day.waveHeightFt);
      const prev = i > 0 ? parseFloat(filteredOutlook[i - 1].waveHeightFt) : 0;
      // A swell event is when height jumps by 2ft+ from the previous day
      if (heightFt >= 5 && heightFt - prev >= 2) {
        swellEvents.push({
          date: day.date,
          dayLabel: day.dayLabel,
          waveHeightFt: day.waveHeightFt,
          period: day.periodSeconds,
          description: heightFt >= 10
            ? `Major swell arriving — ${day.waveHeightFt}ft @ ${day.periodSeconds}s`
            : `Swell building to ${day.waveHeightFt}ft @ ${day.periodSeconds}s`,
          significance: heightFt >= 10 ? 'epic' : heightFt >= 7 ? 'solid' : 'moderate',
        });
      }
    }

    const verdict = generateSurfVerdict({
      waveHeightFt: consensusWaveHeightFt,
      period,
      swellDirScore,
      windDirScore,
      windSpeed: windSpeedMph,
      swellQuality,
      score: overallScore,
      isInSeason,
    });

    return {
      waveHeightFt: consensusWaveHeightFt?.toFixed(1) ?? null,
      waveHeightM: consensusWaveHeightFt ? (consensusWaveHeightFt / 3.28084).toFixed(1) : null,
      wavePeriod: period?.toFixed(1) ?? null,
      waveDirection: waveDir?.toFixed(0) ?? null,

      primarySwell: c.swell_wave_height ? {
        heightFt: c.swell_wave_height.toFixed(1),
        heightM: (c.swell_wave_height / 3.28084).toFixed(1),
        periodSeconds: (c.swell_wave_peak_period ?? c.swell_wave_period ?? 0).toFixed(1),
        directionDegrees: (c.swell_wave_direction ?? 0).toFixed(0),
        directionLabel: degreesToCardinal(c.swell_wave_direction ?? 0),
      } : null,

      secondarySwell: c.secondary_swell_wave_height ? {
        heightFt: c.secondary_swell_wave_height.toFixed(1),
        heightM: (c.secondary_swell_wave_height / 3.28084).toFixed(1),
        periodSeconds: (c.secondary_swell_wave_period ?? 0).toFixed(1),
        directionDegrees: (c.secondary_swell_wave_direction ?? 0).toFixed(0),
        directionLabel: degreesToCardinal(c.secondary_swell_wave_direction ?? 0),
      } : null,

      tertiarySwell: c.tertiary_swell_wave_height ? {
        heightFt: c.tertiary_swell_wave_height.toFixed(1),
        heightM: (c.tertiary_swell_wave_height / 3.28084).toFixed(1),
        periodSeconds: (c.tertiary_swell_wave_period ?? 0).toFixed(1),
        directionDegrees: (c.tertiary_swell_wave_direction ?? 0).toFixed(0),
        directionLabel: degreesToCardinal(c.tertiary_swell_wave_direction ?? 0),
      } : null,

      windSpeedMph: windSpeedMph?.toFixed(1) ?? null,
      windDirection: windDir?.toFixed(0) ?? null,
      windDirectionLabel: windDir ? degreesToCardinal(windDir) : null,

      seaTempC: seaTempC?.toFixed(1) ?? null,
      seaTempF: seaTempC ? (seaTempC * 9/5 + 32).toFixed(0) : null,
      wetsuitRecommendation: seaTempC ? wetsuitRecommendation(seaTempC) : null,

      swellQuality,
      swellDirectionScore: swellDirScore,
      windDirectionScore: windDirScore,
      overallScore,
      verdict,

      modelCount: respondingModelCount,
      confidenceScore,
      dataNote: respondingModelCount === 1 ? 'Limited data — only 1 of 3 models responding. Forecast may be less reliable.' : null,
      modelBreakdown: {
        ecmwf: ecmwfWave !== null ? ecmwfWave.toFixed(1) : null,
        gfs: gfsWave !== null ? gfsWave.toFixed(1) : null,
        icon: iconWave !== null ? iconWave.toFixed(1) : null,
        windy: null,
      },

      outlook: filteredOutlook,
      bestDayThisWeek,
      bestDayNextWeek,
      swellEvents,

      updatedAt: new Date().toISOString(),
    };

  } catch (err) {
    console.error('getSurfConditions error:', err);
    return {
      waveHeightFt: null, waveHeightM: null, wavePeriod: null, waveDirection: null,
      primarySwell: null, secondarySwell: null, tertiarySwell: null,
      windSpeedMph: null, windDirection: null, windDirectionLabel: null,
      seaTempC: null, seaTempF: null, wetsuitRecommendation: null,
      swellQuality: 'unknown', swellDirectionScore: 0, windDirectionScore: 0,
      overallScore: 0, verdict: 'Unable to retrieve conditions data at this time.',
      modelCount: 0, confidenceScore: 0, dataNote: null,
      modelBreakdown: { ecmwf: null, gfs: null, icon: null, windy: null },
      outlook: [], bestDayThisWeek: null, bestDayNextWeek: null, swellEvents: [],
      updatedAt: new Date().toISOString(),
    };
  }
}
