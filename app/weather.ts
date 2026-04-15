export async function getSnowForecast(lat: number, lon: number) {
  try {
    const [iconRes, ecmwfRes, gfsRes] = await Promise.all([
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=snowfall_sum,snow_depth_max,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_probability_max&timezone=auto&forecast_days=16`,
        { next: { revalidate: 3600 } }
      ),
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=snowfall_sum,snow_depth_max&timezone=auto&forecast_days=10&models=ecmwf_ifs025`,
        { next: { revalidate: 3600 } }
      ),
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=snowfall_sum,snow_depth_max&timezone=auto&forecast_days=16&models=gfs025`,
        { next: { revalidate: 3600 } }
      ),
    ]);

    const icon = await iconRes.json();
    const ecmwf = await ecmwfRes.json();
    const gfs = await gfsRes.json();

    if (!icon.daily?.snowfall_sum) {
      return { daily: { snowfall_sum: [0,0,0,0,0,0,0] } };
    }

    const iconSnow = icon.daily.snowfall_sum.reduce((a: number, b: number) => a + b, 0);
    const ecmwfSnow = ecmwf.daily?.snowfall_sum?.reduce((a: number, b: number) => a + b, 0) ?? null;
    const gfsSnow = gfs.daily?.snowfall_sum?.reduce((a: number, b: number) => a + b, 0) ?? null;

    const snowModels = [iconSnow, ecmwfSnow, gfsSnow].filter(m => m !== null) as number[];
    const consensusSnow = snowModels.reduce((a, b) => a + b, 0) / snowModels.length;

    const maxSnowDiff = Math.max(...snowModels) - Math.min(...snowModels);
    const snowConfidence = maxSnowDiff < 5 ? 95 : maxSnowDiff < 15 ? 80 : maxSnowDiff < 30 ? 60 : 40;

    const iconDepth = icon.daily.snow_depth_max?.[0] ?? null;
    const ecmwfDepth = ecmwf.daily?.snow_depth_max?.[0] ?? null;
    const gfsDepth = gfs.daily?.snow_depth_max?.[0] ?? null;
    const depthModels = [iconDepth, ecmwfDepth, gfsDepth].filter(m => m !== null) as number[];
    const consensusDepth = depthModels.length ? depthModels.reduce((a, b) => a + b, 0) / depthModels.length : null;

    return {
      daily: {
        snowfall_sum: icon.daily.snowfall_sum,
        snow_depth_max: icon.daily.snow_depth_max,
        temperature_2m_max: icon.daily.temperature_2m_max,
        temperature_2m_min: icon.daily.temperature_2m_min,
        wind_speed_10m_max: icon.daily.wind_speed_10m_max,
        precipitation_probability_max: icon.daily.precipitation_probability_max,
      },
      consensus: {
        totalSnowCm: consensusSnow.toFixed(1),
        totalSnowIn: (consensusSnow / 2.54).toFixed(1),
        snowDepthCm: consensusDepth?.toFixed(1) ?? null,
        snowDepthIn: consensusDepth ? (consensusDepth * 39.3701).toFixed(1) : null,
        confidence: snowConfidence,
        modelCount: snowModels.length,
        iconSnow: iconSnow.toFixed(1),
        ecmwfSnow: ecmwfSnow?.toFixed(1) ?? null,
        gfsSnow: gfsSnow?.toFixed(1) ?? null,
      }
    };
  } catch {
    return { daily: { snowfall_sum: [0,0,0,0,0,0,0] } };
  }
}