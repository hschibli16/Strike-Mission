import { getWindyForecast } from './windy';

export async function getSwellData(lat: number, lon: number) {
  try {
    const [marineRes, windRes, windyData, ecmwfRes, mfwamRes, gfsWaveRes] = await Promise.all([
      fetch(
        `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period,secondary_swell_wave_height,secondary_swell_wave_period,secondary_swell_wave_direction,tertiary_swell_wave_height,tertiary_swell_wave_period,tertiary_swell_wave_direction,sea_surface_temperature,ocean_current_velocity,ocean_current_direction&daily=wave_height_max,wave_direction_dominant,wave_period_max,swell_wave_height_max,swell_wave_direction_dominant,swell_wave_period_max,swell_wave_peak_period_max&hourly=wave_height,swell_wave_height,swell_wave_direction,swell_wave_period,secondary_swell_wave_height,secondary_swell_wave_direction,tertiary_swell_wave_height&length_unit=imperial&wind_speed_unit=mph&forecast_days=16&timezone=auto`,
        { next: { revalidate: 1800 } }
      ),
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=wind_speed_10m,wind_direction_10m&hourly=wind_speed_10m,wind_direction_10m&wind_speed_unit=mph&forecast_days=16&timezone=auto`,
        { next: { revalidate: 1800 } }
      ),
      getWindyForecast(lat, lon),
      fetch(
        `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period&length_unit=imperial&wind_speed_unit=mph&forecast_days=16&timezone=auto&models=ewam`,
        { next: { revalidate: 1800 } }
      ),
      fetch(
        `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,swell_wave_height&length_unit=imperial&forecast_days=7&timezone=auto&models=mfwam`,
        { next: { revalidate: 1800 } }
      ),
      fetch(
        `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,swell_wave_height&length_unit=imperial&forecast_days=7&timezone=auto&models=gfs_wave`,
        { next: { revalidate: 1800 } }
      ),
    ]);

    const marine = await marineRes.json();
    const wind = await windRes.json();
    const ecmwf = await ecmwfRes.json();
    const mfwam = await mfwamRes.json();
    const gfsWave = await gfsWaveRes.json();
    const ecmwfWaveHeight = ecmwf.current?.wave_height ?? null;
    const mfwamWaveHeight = mfwam.current?.wave_height ?? null;
    const gfsWaveHeight = gfsWave.current?.wave_height ?? null;

    if (!marine.current) return null;

    const c = marine.current;
    const daily = marine.daily;
    const windCurrent = wind.current;

    const forecast7DayFt = daily?.wave_height_max?.slice(0, 7).map((h: number) => h?.toFixed(1) ?? '0') ?? [];
    const forecast7DayDir = daily?.wave_direction_dominant?.slice(0, 7) ?? [];
    const forecast7DayPeriod = daily?.wave_period_max?.slice(0, 7) ?? [];
    const forecast7DaySwellFt = daily?.swell_wave_height_max?.slice(0, 7).map((h: number) => h?.toFixed(1) ?? '0') ?? [];

    // Cross reference Open-Meteo, Windy, and ECMWF for confidence scoring
    let confidenceScore = 50;
    let consensusWaveHeight = c.wave_height?.toFixed(1) ?? null;
    let consensusWaveHeightFt = c.wave_height?.toFixed(1) ?? null;

    const models = [c.wave_height];
    if (windyData?.waveHeightFt) models.push(parseFloat(windyData.waveHeightFt) / 3.28084);
    if (ecmwfWaveHeight) models.push(ecmwfWaveHeight);
    if (mfwamWaveHeight) models.push(mfwamWaveHeight);
    if (gfsWaveHeight) models.push(gfsWaveHeight);

    const validModels = models.filter(m => m !== null && m !== undefined) as number[];

    if (validModels.length >= 2) {
      const avg = validModels.reduce((a, b) => a + b, 0) / validModels.length;
      const maxDiff = Math.max(...validModels) - Math.min(...validModels);

      if (validModels.length >= 4) {
        if (maxDiff < 0.3) confidenceScore = 99;
        else if (maxDiff < 0.5) confidenceScore = 92;
        else if (maxDiff < 0.8) confidenceScore = 80;
        else if (maxDiff < 1.2) confidenceScore = 65;
        else if (maxDiff < 2.0) confidenceScore = 45;
        else confidenceScore = 25;
      } else if (validModels.length === 3) {
        if (maxDiff < 0.3) confidenceScore = 95;
        else if (maxDiff < 0.6) confidenceScore = 82;
        else if (maxDiff < 1.0) confidenceScore = 68;
        else confidenceScore = 40;
      } else {
        if (maxDiff < 0.3) confidenceScore = 88;
        else if (maxDiff < 0.6) confidenceScore = 72;
        else confidenceScore = 45;
      }

      consensusWaveHeight = avg.toFixed(1);
      consensusWaveHeightFt = (avg * 3.28084).toFixed(1);
    }

    return {
      waveHeight: consensusWaveHeight,
      waveHeightFt: consensusWaveHeightFt,
      wavePeriod: c.wave_peak_period?.toFixed(1) ?? c.wave_period?.toFixed(1) ?? null,
      waveDirection: c.wave_direction?.toFixed(0) ?? null,
      swellHeight: c.swell_wave_height?.toFixed(1) ?? null,
      swellHeightFt: c.swell_wave_height?.toFixed(1) ?? null,
      swellPeriod: c.swell_wave_peak_period?.toFixed(1) ?? c.swell_wave_period?.toFixed(1) ?? null,
      swellDirection: c.swell_wave_direction?.toFixed(0) ?? null,
      secondarySwellHeight: c.secondary_swell_wave_height?.toFixed(1) ?? null,
      secondarySwellDirection: c.secondary_swell_wave_direction?.toFixed(0) ?? null,
      secondarySwellPeriod: c.secondary_swell_wave_period?.toFixed(1) ?? null,
      tertiarySwellHeight: c.tertiary_swell_wave_height?.toFixed(1) ?? null,
      tertiarySwellDirection: c.tertiary_swell_wave_direction?.toFixed(0) ?? null,
      tertiarySwellPeriod: c.tertiary_swell_wave_period?.toFixed(1) ?? null,
      windWaveHeight: c.wind_wave_height?.toFixed(1) ?? null,
      windSpeed: windyData?.windSpeed ?? windCurrent?.wind_speed_10m?.toFixed(1) ?? null,
      windDirection: windyData?.windDirection ?? windCurrent?.wind_direction_10m?.toFixed(0) ?? null,
      seaTemp: c.sea_surface_temperature?.toFixed(1) ?? null,
      oceanCurrentSpeed: c.ocean_current_velocity?.toFixed(1) ?? null,
      oceanCurrentDirection: c.ocean_current_direction?.toFixed(0) ?? null,
      confidenceScore,
      windyData,
      ecmwfWaveHeight: ecmwfWaveHeight?.toFixed(1) ?? null,
      ecmwfWaveHeightFt: ecmwfWaveHeight ? (ecmwfWaveHeight * 3.28084).toFixed(1) : null,
      mfwamWaveHeight: mfwamWaveHeight?.toFixed(1) ?? null,
      gfsWaveHeight: gfsWaveHeight?.toFixed(1) ?? null,
      modelCount: validModels.length,
      forecast7DayFt,
      forecast7DayDir,
      forecast7DayPeriod,
      forecast7DaySwellFt,
    };
  } catch {
    return null;
  }
}
