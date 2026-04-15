export async function getWindyForecast(lat: number, lon: number) {
  try {
    const response = await fetch(
      'https://api.windy.com/api/point-forecast/v2',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat,
          lon,
          model: 'gfs',
          parameters: ['wind', 'waves', 'swell1', 'swell2'],
          levels: ['surface'],
          key: process.env.WINDY_API_KEY,
        }),
        next: { revalidate: 3600 },
      }
    );

    const data = await response.json();
    if (!data['wind_u-surface']) return null;

    const now = new Date();
    const timestamps = data.ts ?? [];
    const idx = Math.max(0, timestamps.findIndex((t: number) => new Date(t) >= now));

    const windU = data['wind_u-surface']?.[idx] ?? 0;
    const windV = data['wind_v-surface']?.[idx] ?? 0;
    const windSpeed = Math.sqrt(windU * windU + windV * windV);
    const windDir = (Math.atan2(windU, windV) * 180 / Math.PI + 180) % 360;

    const waveHeight = data['waves_height-surface']?.[idx] ?? null;
    const wavePeriod = data['waves_period-surface']?.[idx] ?? null;
    const waveDir = data['waves_direction-surface']?.[idx] ?? null;

    const swell1Height = data['swell1_height-surface']?.[idx] ?? null;
    const swell1Period = data['swell1_period-surface']?.[idx] ?? null;
    const swell1Dir = data['swell1_direction-surface']?.[idx] ?? null;

    const swell2Height = data['swell2_height-surface']?.[idx] ?? null;
    const swell2Period = data['swell2_period-surface']?.[idx] ?? null;
    const swell2Dir = data['swell2_direction-surface']?.[idx] ?? null;

    const waveHeightFt = waveHeight ? (waveHeight * 3.28084).toFixed(1) : null;
    const swell1HeightFt = swell1Height ? (swell1Height * 3.28084).toFixed(1) : null;

    return {
      windSpeed: (windSpeed * 2.237).toFixed(1),
      windDirection: windDir.toFixed(0),
      waveHeight: waveHeight?.toFixed(1) ?? null,
      waveHeightFt,
      wavePeriod: wavePeriod?.toFixed(1) ?? null,
      waveDirection: waveDir?.toFixed(0) ?? null,
      swell1Height: swell1Height?.toFixed(1) ?? null,
      swell1HeightFt,
      swell1Period: swell1Period?.toFixed(1) ?? null,
      swell1Direction: swell1Dir?.toFixed(0) ?? null,
      swell2Height: swell2Height?.toFixed(1) ?? null,
      swell2Period: swell2Period?.toFixed(1) ?? null,
      swell2Direction: swell2Dir?.toFixed(0) ?? null,
    };
  } catch {
    return null;
  }
}
