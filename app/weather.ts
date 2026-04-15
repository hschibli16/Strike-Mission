export async function getSnowForecast(lat: number, lon: number) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=snowfall_sum&timezone=auto&forecast_days=7`,
      { next: { revalidate: 3600 } }
    );
    const data = await response.json();
    if (!data.daily?.snowfall_sum) {
      return { daily: { snowfall_sum: [0, 0, 0, 0, 0, 0, 0] } };
    }
    return data;
  } catch {
    return { daily: { snowfall_sum: [0, 0, 0, 0, 0, 0, 0] } };
  }
}