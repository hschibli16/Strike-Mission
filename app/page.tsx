import { getSnowForecast } from './weather';

const SKI_RESORTS = [
  { name: 'Whistler, Canada', lat: 50.1163, lon: -122.9574 },
  { name: 'Chamonix, France', lat: 45.9237, lon: 6.8694 },
  { name: 'Niseko, Japan', lat: 42.8042, lon: 140.6875 },
  { name: 'Verbier, Switzerland', lat: 46.0959, lon: 7.2283 },
  { name: 'Snowbird, Utah', lat: 40.5830, lon: -111.6556 },
];

export default async function Home() {
  const forecasts = await Promise.all(
    SKI_RESORTS.map(async (resort) => {
      const data = await getSnowForecast(resort.lat, resort.lon);
      const totalSnow = data.daily.snowfall_sum.reduce((a: number, b: number) => a + b, 0);
      return { name: resort.name, totalSnow: totalSnow.toFixed(1) };
    })
  );

  const sorted = forecasts.sort((a, b) => Number(b.totalSnow) - Number(a.totalSnow));

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '40px', background: '#0a0a0a', minHeight: '100vh', color: 'white' }}>
      <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#00d4ff' }}>Strike Mission</h1>
      <p style={{ fontSize: '20px', color: '#aaa', marginTop: '12px' }}>
        Score the best waves and snow on earth. Last-minute trips, perfectly timed.
      </p>
      <h2 style={{ marginTop: '48px', color: '#00d4ff' }}>🎿 Best Snow This Week</h2>
      {sorted.map((resort) => (
        <div key={resort.name} style={{ marginTop: '16px', padding: '20px', background: '#111', borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '18px' }}>{resort.name}</span>
          <span style={{ fontSize: '18px', color: '#00d4ff', fontWeight: 'bold' }}>{resort.totalSnow} cm</span>
        </div>
      ))}
    </main>
  );
}