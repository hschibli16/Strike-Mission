export async function getBuoyData(buoyId: string) {
  try {
    const response = await fetch(
      `https://www.ndbc.noaa.gov/data/realtime2/${buoyId}.txt`,
      { next: { revalidate: 3600 } }
    );
    const text = await response.text();
    const lines = text.split('\n');
    const headers = lines[0].replace('#', '').trim().split(/\s+/);
    
    // Find first data line that isn't all MM
    const dataLine = lines.slice(2).find(line => {
      const parts = line.trim().split(/\s+/);
      return parts.length > 5 && parts.some(p => p !== 'MM');
    });

    if (!dataLine) return null;

    const latest = dataLine.trim().split(/\s+/);

    const getValue = (key: string) => {
      const idx = headers.indexOf(key);
      const val = idx >= 0 ? latest[idx] : 'MM';
      return val === 'MM' ? null : val;
    };

    const waveHeightM = getValue('WVHT');
    const waveHeightFt = waveHeightM 
      ? (parseFloat(waveHeightM) * 3.28084).toFixed(1) 
      : null;

    return {
      waveHeight: waveHeightM,
      waveHeightFt,
      dominantPeriod: getValue('DPD'),
      windSpeed: getValue('WSPD'),
      windDirection: getValue('WDIR'),
    };
  } catch {
    return null;
  }
}
