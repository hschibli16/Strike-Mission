export async function getSkiResortData(location: string) {
  try {
    const url = `https://api.worldweatheronline.com/premium/v1/ski.ashx?key=${process.env.WORLDWEATHERONLINE_API_KEY}&q=${encodeURIComponent(location)}&format=json&num_of_days=7`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    const data = await response.json();

    const weather = data.data?.weather?.[0];
    if (!weather) return null;

    const bottom = weather.bottom?.[0];
    const hourly = weather.hourly?.[0];
    const hourlyBottom = hourly?.bottom?.[0];
    const hourlyTop = hourly?.top?.[0];
    const hourlyMid = hourly?.mid?.[0];

    return {
      maxTempF: bottom?.maxtempF ?? weather.maxtempF ?? null,
      minTempF: bottom?.mintempF ?? weather.mintempF ?? null,
      maxTempC: bottom?.maxtempC ?? weather.maxtempC ?? null,
      minTempC: bottom?.mintempC ?? weather.mintempC ?? null,
      snowfall: hourlyBottom?.snowfall_cm ?? hourly?.snowfall_cm ?? '0',
      snowDepth: hourlyBottom?.snow_depth ?? hourly?.snow_depth ?? '0',
      freezeLevel: hourlyBottom?.freezeLevel ?? hourly?.freezeLevel ?? null,
      windSpeedMph: hourlyBottom?.windspeedMiles ?? hourly?.windspeedMiles ?? null,
      weatherDesc: hourlyBottom?.weatherDesc?.[0]?.value ?? hourly?.weatherDesc?.[0]?.value ?? null,
      chanceOfSnow: weather.chanceofsnow ?? hourly?.chanceofsnow ?? '0',
      topTempF: hourlyTop?.tempF ?? null,
      topTempC: hourlyTop?.tempC ?? null,
      midTempF: hourlyMid?.tempF ?? null,
      topWeatherDesc: hourlyTop?.weatherDesc?.[0]?.value ?? null,
      forecast: data.data?.weather?.map((day: any) => ({
        date: day.date,
        maxTempF: day.bottom?.[0]?.maxtempF ?? day.maxtempF ?? null,
        minTempF: day.bottom?.[0]?.mintempF ?? day.mintempF ?? null,
        snowfall: day.hourly?.[0]?.bottom?.[0]?.snowfall_cm ?? day.hourly?.[0]?.snowfall_cm ?? '0',
        snowDepth: day.hourly?.[0]?.bottom?.[0]?.snow_depth ?? day.hourly?.[0]?.snow_depth ?? '0',
        chanceOfSnow: day.chanceofsnow ?? day.hourly?.[0]?.chanceofsnow ?? '0',
        desc: day.hourly?.[0]?.bottom?.[0]?.weatherDesc?.[0]?.value ?? day.hourly?.[0]?.weatherDesc?.[0]?.value ?? '',
      })) ?? [],
    };
  } catch (error) {
    console.log('Ski resort API error:', error);
    return null;
  }
}
