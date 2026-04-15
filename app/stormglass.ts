export async function getSwellData(lat: number, lon: number) {
  try {
    const [marineRes, windRes] = await Promise.all([
      fetch(
        `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,wave_peak_period,wind_wave_height,wind_wave_direction,wind_wave_period,wind_wave_peak_period,swell_wave_height,swell_wave_direction,swell_wave_period,swell_wave_peak_period,secondary_swell_wave_height,secondary_swell_wave_period,secondary_swell_wave_direction,tertiary_swell_wave_height,tertiary_swell_wave_period,tertiary_swell_wave_direction,sea_surface_temperature,ocean_current_velocity,ocean_current_direction&daily=wave_height_max,wave_direction_dominant,wave_period_max,swell_wave_height_max,swell_wave_direction_dominant,swell_wave_period_max,swell_wave_peak_period_max&hourly=wave_height,swell_wave_height,swell_wave_direction,swell_wave_period,secondary_swell_wave_height,secondary_swell_wave_direction,tertiary_swell_wave_height&length_unit=imperial&wind_speed_unit=mph&forecast_days=16&timezone=auto`,
        { next: { revalidate: 1800 } }
      ),
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=wind_speed_10m,wind_direction_10m&hourly=wind_speed_10m,wind_direction_10m&wind_speed_unit=mph&forecast_days=16&timezone=auto`,
        { next: { revalidate: 1800 } }
      )
    ]);

    const marine = await marineRes.json();
    const wind = await windRes.json();

    if (!marine.current) return null;

    const c = marine.current;
    const daily = marine.daily;
    const windCurrent = wind.current;

    const forecast7DayFt = daily?.wave_height_max?.map((h: number) => h?.toFixed(1) ?? '0') ?? [];
    const forecast7DayDir = daily?.wave_direction_dominant ?? [];
    const forecast7DayPeriod = daily?.wave_period_max ?? [];
    const forecast7DaySwellFt = daily?.swell_wave_height_max?.map((h: number) => h?.toFixed(1) ?? '0') ?? [];

    return {
      waveHeight: c.wave_height?.toFixed(1) ?? null,
      waveHeightFt: c.wave_height?.toFixed(1) ?? null,
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
      windSpeed: windCurrent?.wind_speed_10m?.toFixed(1) ?? null,
      windDirection: windCurrent?.wind_direction_10m?.toFixed(0) ?? null,
      seaTemp: c.sea_surface_temperature?.toFixed(1) ?? null,
      oceanCurrentSpeed: c.ocean_current_velocity?.toFixed(1) ?? null,
      oceanCurrentDirection: c.ocean_current_direction?.toFixed(0) ?? null,
      forecast7DayFt,
      forecast7DayDir,
      forecast7DayPeriod,
      forecast7DaySwellFt,
    };
  } catch {
    return null;
  }
}
