export async function getSwellData(lat: number, lon: number) {
  const params = [
    'waveHeight',
    'wavePeriod',
    'waveDirection',
    'windSpeed',
    'windDirection',
    'swellHeight',
    'swellPeriod',
    'swellDirection',
  ].join(',');

  const response = await fetch(
    `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lon}&params=${params}`,
    {
      headers: {
        Authorization: process.env.STORMGLASS_API_KEY!,
      },
      next: { revalidate: 3600 },
    }
  );

  const data = await response.json();
  
  if (!data.hours || data.hours.length === 0) return null;

  const latest = data.hours[0];
  const get = (key: string) => latest[key]?.sg?.toFixed(1) ?? 'N/A';

  const waveHeightM = get('waveHeight');
  const waveHeightFt = waveHeightM !== 'N/A' 
    ? (parseFloat(waveHeightM) * 3.28084).toFixed(1) 
    : 'N/A';

  return {
    waveHeight: waveHeightM,
    waveHeightFt,
    wavePeriod: get('wavePeriod'),
    waveDirection: get('waveDirection'),
    swellHeight: get('swellHeight'),
    windSpeed: get('windSpeed'),
  };
}