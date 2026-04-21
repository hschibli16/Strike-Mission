import type { SkiConditions, SkiDayOutlook } from './types';

function classifySnowType(tempC: number | null, freshSnow24h: number): 'powder' | 'packed' | 'corn' | 'icy' | 'wet' | 'unknown' {
  if (tempC === null) return 'unknown';
  if (freshSnow24h >= 10 && tempC <= -5) return 'powder';
  if (freshSnow24h >= 5 && tempC <= 0) return 'packed';
  if (tempC > 2 && tempC < 8) return 'corn';
  if (tempC <= -8 && freshSnow24h < 2) return 'icy';
  if (tempC >= 8) return 'wet';
  return 'packed';
}

function classifySeasonType(month: number, bestMonths: number[], tempC: number | null): 'peak' | 'early' | 'spring' | 'off' | 'summer' {
  if (!bestMonths.includes(month)) {
    if (month >= 6 && month <= 8) return 'summer';
    return 'off';
  }
  if (tempC !== null && tempC > 3) return 'spring';
  const peakMonths = bestMonths.filter(m => m >= 12 || m <= 3);
  if (peakMonths.includes(month)) return 'peak';
  return 'early';
}

function generateSkiVerdict(params: {
  freshSnow24h: number;
  freshSnow48h: number;
  freshSnow72h: number;
  forecastTotal: number;
  snowType: string;
  seasonType: string;
  tempC: number | null;
  windMph: number | null;
  score: number;
  nextPowderDay: SkiDayOutlook | null;
}): string {
  const { freshSnow24h, freshSnow48h, freshSnow72h, forecastTotal, snowType, seasonType, tempC, windMph, score, nextPowderDay } = params;

  if (seasonType === 'summer') return 'Resort is closed for summer. Come back in November.';
  if (seasonType === 'off') return 'Outside the main ski season. Some resorts may have limited terrain open.';

  const parts: string[] = [];

  if (seasonType === 'spring') {
    parts.push('Spring skiing conditions');
    if (tempC && tempC > 0) parts.push(`with temperatures around ${(tempC * 9/5 + 32).toFixed(0)}°F — expect softening snow by afternoon`);
    parts.push('Good for groomer runs, avoid south-facing terrain in the afternoon');
    return parts.join('. ') + '.';
  }

  // Fresh snow report
  if (freshSnow24h >= 30) parts.push(`Major dump — ${(freshSnow24h / 2.54).toFixed(0)}" in the last 24 hours. Powder day`);
  else if (freshSnow24h >= 15) parts.push(`Good overnight snowfall — ${(freshSnow24h / 2.54).toFixed(0)}" fresh`);
  else if (freshSnow24h >= 5) parts.push(`Light overnight snow — ${(freshSnow24h / 2.54).toFixed(0)}" fresh`);
  else if (freshSnow72h >= 15) parts.push(`${(freshSnow72h / 2.54).toFixed(0)}" of snow in the last 3 days`);
  else parts.push('No significant recent snowfall');

  // Snow type
  if (snowType === 'powder') parts.push('cold dry powder — hit the trees early');
  else if (snowType === 'corn') parts.push('spring corn developing — best skiing mid-morning when it softens');
  else if (snowType === 'icy') parts.push('cold and icy — stick to groomers');
  else if (snowType === 'wet') parts.push('wet heavy snow — manageable but tiring');

  // Temperature
  if (tempC !== null) {
    const tempF = (tempC * 9/5 + 32).toFixed(0);
    if (tempC <= -15) parts.push(`Very cold at ${tempF}°F — dress in serious layers`);
    else if (tempC <= -5) parts.push(`Cold temperatures holding the snow at ${tempF}°F`);
    else if (tempC <= 0) parts.push(`Just below freezing at ${tempF}°F`);
  }

  // Wind
  if (windMph && windMph > 40) parts.push('High winds may affect upper mountain lifts');
  else if (windMph && windMph > 25) parts.push('Moderate winds on exposed terrain');

  // Outlook
  if (forecastTotal >= 30) parts.push(`Heavy snowfall forecast this week — ${(forecastTotal / 2.54).toFixed(0)}" total expected`);
  else if (forecastTotal >= 15) parts.push(`Solid snowfall forecast — ${(forecastTotal / 2.54).toFixed(0)}" expected this week`);
  else if (nextPowderDay) parts.push(`Next powder opportunity: ${nextPowderDay.dayLabel}`);

  return parts.join('. ') + '.';
}

export async function getSkiConditions(params: {
  lat: number;
  lon: number;
  location: string;
  skiResortQuery?: string;
  bestMonths: number[];
  flightPrice: number;
}): Promise<SkiConditions> {
  const { lat, lon, location, skiResortQuery, bestMonths } = params;
  const currentMonth = new Date().getMonth() + 1;

  try {
    // Fetch multi-model snow data + resort specific data in parallel
    const [iconRes, ecmwfRes, gfsRes, wwoRes] = await Promise.all([
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=snowfall_sum,snow_depth_max,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_probability_max&hourly=snowfall,temperature_2m&timezone=auto&forecast_days=10`,
        { next: { revalidate: 3600 } }
      ),
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=snowfall_sum,snow_depth_max,temperature_2m_min&timezone=auto&forecast_days=10&models=ecmwf_ifs025`,
        { next: { revalidate: 3600 } }
      ),
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=snowfall_sum,snow_depth_max&timezone=auto&forecast_days=10&models=gfs025`,
        { next: { revalidate: 3600 } }
      ),
      fetch(
        `https://api.worldweatheronline.com/premium/v1/ski.ashx?key=${process.env.WORLDWEATHERONLINE_API_KEY}&q=${encodeURIComponent(skiResortQuery ?? location)}&format=json&num_of_days=7`,
        { next: { revalidate: 3600 } }
      ).catch(() => null),
    ]);

    const [icon, ecmwf, gfs] = await Promise.all([
      iconRes.json(), ecmwfRes.json(), gfsRes.json(),
    ]);
    const wwo = wwoRes ? await wwoRes.json().catch(() => null) : null;

    // Snow consensus across models for 7-day total
    const iconTotal = (icon.daily?.snowfall_sum ?? []).slice(0, 7).reduce((a: number, b: number) => a + b, 0);
    const ecmwfTotal = ecmwf.daily?.snowfall_sum ? (ecmwf.daily.snowfall_sum as number[]).slice(0, 7).reduce((a, b) => a + b, 0) : null;
    const gfsTotal = gfs.daily?.snowfall_sum ? (gfs.daily.snowfall_sum as number[]).slice(0, 7).reduce((a, b) => a + b, 0) : null;

    // Weighted consensus — ECMWF 45%, ICON 35%, GFS 20%
    const snowModels: { value: number; weight: number }[] = [{ value: iconTotal, weight: 0.35 }];
    if (ecmwfTotal !== null) snowModels.push({ value: ecmwfTotal, weight: 0.45 });
    if (gfsTotal !== null) snowModels.push({ value: gfsTotal, weight: 0.20 });
    const totalWeight = snowModels.reduce((s, m) => s + m.weight, 0);
    const consensusTotal = snowModels.reduce((s, m) => s + m.value * (m.weight / totalWeight), 0);

    const maxDiff = Math.max(...snowModels.map(m => m.value)) - Math.min(...snowModels.map(m => m.value));
    const confidenceScore = snowModels.length >= 3
      ? maxDiff < 5 ? 95 : maxDiff < 15 ? 80 : maxDiff < 30 ? 60 : 35
      : snowModels.length === 2
        ? maxDiff < 5 ? 80 : maxDiff < 15 ? 65 : 40
        : 35;

    // Fresh snow — last 24h, 48h, 72h from hourly data
    const hourlySnow = icon.hourly?.snowfall ?? [];
    const freshSnow24h = hourlySnow.slice(0, 24).reduce((a: number, b: number) => a + b, 0);
    const freshSnow48h = hourlySnow.slice(0, 48).reduce((a: number, b: number) => a + b, 0);
    const freshSnow72h = hourlySnow.slice(0, 72).reduce((a: number, b: number) => a + b, 0);

    // Temperature
    const tempMin = icon.daily?.temperature_2m_min?.[0] ?? null;
    const tempMax = icon.daily?.temperature_2m_max?.[0] ?? null;
    const windMax = icon.daily?.wind_speed_10m_max?.[0] ?? null;

    // WWO resort data
    const wwoWeather = wwo?.data?.weather?.[0] ?? null;
    const wwoHourly = wwoWeather?.hourly?.[0] ?? null;
    const snowDepth = wwoHourly?.snow_depth ?? null;
    const freezeLevel = wwoHourly?.freezeLevel ?? null;
    const chanceOfSnow = wwoWeather?.chanceofsnow ?? wwoHourly?.chanceofsnow ?? null;
    const weatherDesc = wwoHourly?.weatherDesc?.[0]?.value ?? null;
    const wwoMinTempC = wwoWeather?.mintempC ?? null;
    const wwoMaxTempC = wwoWeather?.maxtempC ?? null;

    const snowType = classifySnowType(tempMin, freshSnow24h);
    const seasonType = classifySeasonType(currentMonth, bestMonths, tempMin);

    // Score
    const snowScore = Math.min(consensusTotal / 50, 1) * 50;
    const freshSnowBonus = freshSnow24h >= 20 ? 15 : freshSnow24h >= 10 ? 10 : freshSnow24h >= 5 ? 5 : 0;
    const tempScore = tempMin !== null && tempMin <= -5 ? 10 : tempMin !== null && tempMin <= 0 ? 5 : 0;
    const seasonScore = seasonType === 'peak' ? 20 : seasonType === 'early' ? 10 : seasonType === 'spring' ? 5 : 0;
    const overallScore = Math.min(100, Math.round(snowScore + freshSnowBonus + tempScore + seasonScore));

    // Build 10-day outlook
    const outlook: SkiDayOutlook[] = [];
    const today = new Date();
    const dayLabels = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'];
    const dailySnow = icon.daily?.snowfall_sum ?? [];
    const dailyTempMax = icon.daily?.temperature_2m_max ?? [];
    const dailyTempMin = icon.daily?.temperature_2m_min ?? [];

    for (let i = 0; i < Math.min(10, dailySnow.length); i++) {
      const snowCm = dailySnow[i] ?? 0;
      const tMax = dailyTempMax[i] ?? null;
      const tMin = dailyTempMin[i] ?? null;
      const daySnowType = classifySnowType(tMin, snowCm);
      const isPowder = snowCm >= 10 && (tMin ?? 0) <= -3;

      const dayScore = Math.min(100, Math.round(
        Math.min(snowCm / 50, 1) * 50 +
        (snowCm >= 10 ? 15 : snowCm >= 5 ? 8 : 0) +
        (tMin !== null && tMin <= -5 ? 10 : tMin !== null && tMin <= 0 ? 5 : 0) +
        (seasonType === 'peak' ? 15 : 5)
      ));

      outlook.push({
        date: new Date(today.getTime() + i * 86400000).toISOString().split('T')[0],
        dayLabel: dayLabels[i] ?? `Day ${i + 1}`,
        snowfallCm: snowCm.toFixed(1),
        snowfallIn: (snowCm / 2.54).toFixed(1),
        tempHighF: tMax !== null ? (tMax * 9/5 + 32).toFixed(0) : '—',
        tempLowF: tMin !== null ? (tMin * 9/5 + 32).toFixed(0) : '—',
        snowType: daySnowType,
        description: isPowder ? 'Powder day' : daySnowType === 'corn' ? 'Spring corn' : daySnowType === 'icy' ? 'Icy' : snowCm > 5 ? 'Fresh snow' : 'Groomed',
        score: dayScore,
        isPowderDay: isPowder,
      });
    }

    // Next powder day — first future day with 10cm+ and cold temps
    const nextPowderDay = outlook.slice(1).find(d => d.isPowderDay) ?? null;

    // Storm window — any 3-consecutive-day window with 20cm+ total
    let nextStormWindow = null;
    for (let i = 0; i < outlook.length - 2; i++) {
      const window3Day = outlook.slice(i, i + 3);
      const total3Day = window3Day.reduce((s, d) => s + parseFloat(d.snowfallCm), 0);
      if (total3Day >= 20) {
        nextStormWindow = {
          start: window3Day[0].dayLabel,
          end: window3Day[2].dayLabel,
          totalCm: total3Day.toFixed(0),
        };
        break;
      }
    }

    const verdict = generateSkiVerdict({
      freshSnow24h,
      freshSnow48h,
      freshSnow72h,
      forecastTotal: consensusTotal,
      snowType,
      seasonType,
      tempC: tempMin,
      windMph: windMax,
      score: overallScore,
      nextPowderDay,
    });

    return {
      freshSnow24h: freshSnow24h.toFixed(1),
      freshSnow48h: freshSnow48h.toFixed(1),
      freshSnow72h: freshSnow72h.toFixed(1),
      forecastSnow7Day: consensusTotal.toFixed(1),
      forecastSnow7DayIn: (consensusTotal / 2.54).toFixed(1),
      snowDepthCm: snowDepth?.toString() ?? null,
      snowDepthIn: snowDepth ? (parseFloat(snowDepth) / 2.54).toFixed(1) : null,

      tempAtBaseF: wwoMinTempC !== null ? (parseFloat(wwoMinTempC) * 9/5 + 32).toFixed(0) : tempMin !== null ? (tempMin * 9/5 + 32).toFixed(0) : null,
      tempAtBaseC: wwoMinTempC ?? tempMin?.toFixed(1) ?? null,
      tempAtTopF: freezeLevel ? (parseFloat(freezeLevel) > 0 ? '32' : null) : null,
      tempAtTopC: null,
      freezeLevelM: freezeLevel?.toString() ?? null,
      freezeLevelFt: freezeLevel ? (parseFloat(freezeLevel) * 3.28084).toFixed(0) : null,

      windSpeedMph: windMax?.toFixed(1) ?? null,
      windDescription: windMax ? (windMax > 40 ? 'Strong — upper lifts may close' : windMax > 25 ? 'Moderate' : 'Light') : null,

      snowType,
      seasonType,
      overallScore,
      verdict,

      modelBreakdown: {
        icon: iconTotal.toFixed(1),
        ecmwf: ecmwfTotal?.toFixed(1) ?? null,
        gfs: gfsTotal?.toFixed(1) ?? null,
      },
      confidenceScore,

      outlook,
      nextPowderDay,
      nextStormWindow,

      chanceOfSnow: chanceOfSnow?.toString() ?? null,
      weatherDescription: weatherDesc,

      updatedAt: new Date().toISOString(),
    };

  } catch (err) {
    console.error('getSkiConditions error:', err);
    return {
      freshSnow24h: null, freshSnow48h: null, freshSnow72h: null,
      forecastSnow7Day: '0', forecastSnow7DayIn: '0',
      snowDepthCm: null, snowDepthIn: null,
      tempAtBaseF: null, tempAtBaseC: null, tempAtTopF: null, tempAtTopC: null,
      freezeLevelM: null, freezeLevelFt: null,
      windSpeedMph: null, windDescription: null,
      snowType: 'unknown', seasonType: 'off',
      overallScore: 0, verdict: 'Unable to retrieve conditions data.',
      modelBreakdown: { icon: null, ecmwf: null, gfs: null },
      confidenceScore: 0,
      outlook: [], nextPowderDay: null, nextStormWindow: null,
      chanceOfSnow: null, weatherDescription: null,
      updatedAt: new Date().toISOString(),
    };
  }
}
