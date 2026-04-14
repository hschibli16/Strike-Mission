import { getSnowForecast } from './weather';

const SKI_RESORTS = [
  { name: 'Whistler', location: 'Canada', lat: 50.1163, lon: -122.9574, emoji: '🍁' },
  { name: 'Chamonix', location: 'France', lat: 45.9237, lon: 6.8694, emoji: '🇫🇷' },
  { name: 'Niseko', location: 'Japan', lat: 42.8042, lon: 140.6875, emoji: '🇯🇵' },
  { name: 'Verbier', location: 'Switzerland', lat: 46.0959, lon: 7.2283, emoji: '🇨🇭' },
  { name: 'Snowbird', location: 'Utah', lat: 40.5830, lon: -111.6556, emoji: '🇺🇸' },
];

const SURF_SPOTS = [
  { name: 'Pipeline', location: 'Hawaii', lat: 21.6611, lon: -158.0539, emoji: '🌺' },
  { name: 'Supertubes', location: 'Portugal', lat: 37.0869, lon: -8.7986, emoji: '🇵🇹' },
  { name: 'Uluwatu', location: 'Bali', lat: -8.8291, lon: 115.0849, emoji: '🇮🇩' },
  { name: 'Snapper Rocks', location: 'Australia', lat: -28.1631, lon: 153.5500, emoji: '🇦🇺' },
  { name: 'Jeffreys Bay', location: 'South Africa', lat: -34.0522, lon: 26.7950, emoji: '🇿🇦' },
];

async function getSurfForecast(lat: number, lon: number) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=wave_height_max,wind_speed_10m_max&timezone=auto&forecast_days=7`
  );
  const data = await response.json();
  return data;
}

export default async function Home() {
  const snowForecasts = await Promise.all(
    SKI_RESORTS.map(async (resort) => {
      const data = await getSnowForecast(resort.lat, resort.lon);
      const totalSnow = data.daily.snowfall_sum.reduce((a: number, b: number) => a + b, 0);
      return { ...resort, totalSnow: totalSnow.toFixed(1) };
    })
  );

  const surfForecasts = await Promise.all(
    SURF_SPOTS.map(async (spot) => {
      const data = await getSurfForecast(spot.lat, spot.lon);
      const avgWave = data.daily.wave_height_max
        ? (data.daily.wave_height_max.reduce((a: number, b: number) => a + b, 0) / 7).toFixed(1)
        : 'N/A';
      return { ...spot, avgWave };
    })
  );

  const sortedSnow = snowForecasts.sort((a, b) => Number(b.totalSnow) - Number(a.totalSnow));
  const sortedSurf = surfForecasts.sort((a, b) => Number(b.avgWave) - Number(a.avgWave));

  return (
    <main style={{ fontFamily: 'sans-serif', background: '#0a0a0a', minHeight: '100vh', color: 'white' }}>
      <div style={{ padding: '40px 40px 20px', borderBottom: '1px solid #222' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: '#00d4ff', margin: 0 }}>⚡ Strike Mission</h1>
        <p style={{ fontSize: '18px', color: '#888', marginTop: '8px' }}>
          Real-time conditions. Last-minute trips. Go score.
        </p>
        <a href="/strikes" style={{
          display: 'inline-block', marginTop: '16px', padding: '12px 24px',
          background: '#00d4ff', color: '#000', borderRadius: '8px',
          textDecoration: 'none', fontWeight: 'bold', fontSize: '16px'
        }}>
          ⚡ View Strike Missions →
        </a>
      </div>

      <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        
        <div>
          <h2 style={{ color: '#00d4ff', marginBottom: '20px' }}>🎿 Best Snow This Week</h2>
          {sortedSnow.map((resort, i) => (
            <div key={resort.name} style={{
              marginBottom: '12px', padding: '20px', background: '#111',
              borderRadius: '12px', border: i === 0 ? '1px solid #00d4ff' : '1px solid #222',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{resort.emoji} {resort.name}</div>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{resort.location}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: i === 0 ? '#00d4ff' : 'white' }}>
                  {resort.totalSnow} cm
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>7 day total</div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2 style={{ color: '#00d4ff', marginBottom: '20px' }}>🏄 Best Surf This Week</h2>
          {sortedSurf.map((spot, i) => (
            <div key={spot.name} style={{
              marginBottom: '12px', padding: '20px', background: '#111',
              borderRadius: '12px', border: i === 0 ? '1px solid #00d4ff' : '1px solid #222',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{spot.emoji} {spot.name}</div>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{spot.location}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: i === 0 ? '#00d4ff' : 'white' }}>
                  {spot.avgWave}m
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>avg wave height</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}