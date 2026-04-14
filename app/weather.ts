export async function getSnowForecast(lat: number, lon: number) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=snowfall_sum&timezone=auto&forecast_days=7`
  );
  const data = await response.json();
  return data;
}