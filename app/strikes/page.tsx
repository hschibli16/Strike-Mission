import { getSwellData } from '../stormglass';
import { getSnowForecast } from '../weather';

const SURF_STRIKES = [
  { name: 'Pipeline', location: 'Hawaii', lat: 21.6653, lon: -158.0530, price: 420, hotel: 120, flag: '🌺', description: 'World class barrels on the North Shore', airportCode: 'HNL' },
  { name: 'Supertubes', location: 'Portugal', lat: 37.0869, lon: -8.7986, price: 380, hotel: 60, flag: '🇵🇹', description: 'Powerful beach break, best in Europe', airportCode: 'FAO' },
  { name: 'Uluwatu', location: 'Bali', lat: -8.8291, lon: 115.0849, price: 680, hotel: 35, flag: '🇮🇩', description: 'Legendary reef break at sunset', airportCode: 'DPS' },
  { name: 'Jeffreys Bay', location: 'South Africa', lat: -34.0522, lon: 26.7950, price: 820, hotel: 45, flag: '🇿🇦', description: 'The perfect pointbreak', airportCode: 'PLZ' },
  { name: 'Hossegor', location: 'France', lat: 43.6647, lon: -1.4320, price: 350, hotel: 80, flag: '🇫🇷', description: 'Powerful beach break, Europe\'s surf capital', airportCode: 'BIQ' },
];

const SNOW_STRIKES = [
  { name: 'Whistler', location: 'Canada', lat: 50.1163, lon: -122.9574, price: 280, hotel: 150, flag: '🍁', description: 'Biggest ski resort in North America', airportCode: 'YVR' },
  { name: 'Snowbird', location: 'Utah', lat: 40.5830, lon: -111.6556, price: 180, hotel: 120, flag: '🇺🇸', description: 'Best powder in the Wasatch', airportCode: 'SLC' },
  { name: 'Niseko', location: 'Japan', lat: 42.8042, lon: 140.6875, price: 780, hotel: 100, flag: '🇯🇵', description: 'Legendary Japanese powder', airportCode: 'CTS' },
];

function getWaveRating(waveHeight: string) {
  const h = parseFloat(waveHeight);
  if (isNaN(h)) return { label: 'No data', color: '#666' };
  if (h >= 2.5) return { label: 'FIRING', color: '#00ff88' };
  if (h >= 1.5) return { label: 'GOOD', color: '#00d4ff' };
  if (h >= 0.8) return { label: 'FAIR', color: '#ffaa00' };
  return { label: 'SMALL', color: '#666' };
}

function getSnowRating(totalSnow: number) {
  if (totalSnow >= 30) return { label: 'EPIC', color: '#00ff88' };
  if (totalSnow >= 15) return { label: 'GREAT', color: '#00d4ff' };
  if (totalSnow >= 5) return { label: 'GOOD', color: '#ffaa00' };
  return { label: 'THIN', color: '#666' };
}

function getGoogleFlightsUrl(airportCode: string) {
  const today = new Date();
  const friday = new Date(today);
  friday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));
  const sunday = new Date(friday);
  sunday.setDate(friday.getDate() + 9);
  
  const fmt = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '');
  
  return `https://www.google.com/flights/#search;f=JFK;t=${airportCode};d=${fmt(friday)};r=${fmt(sunday)};tt=r`;
}

export default async function StrikeMissions() {
  const surfData = await Promise.all(
    SURF_STRIKES.map(async (spot) => {
      const swell = await getSwellData(spot.lat, spot.lon);
      const rating = getWaveRating(swell?.waveHeight ?? 'N/A');
      const tripCost = spot.price + (spot.hotel * 5);
      return { ...spot, swell, rating, tripCost };
    })
  );

  const snowData = await Promise.all(
    SNOW_STRIKES.map(async (resort) => {
      const forecast = await getSnowForecast(resort.lat, resort.lon);
      const totalSnow = forecast.daily.snowfall_sum.reduce((a: number, b: number) => a + b, 0);
      const rating = getSnowRating(totalSnow);
      const tripCost = resort.price + (resort.hotel * 5);
      return { ...resort, totalSnow: totalSnow.toFixed(1), rating, tripCost };
    })
  );

  const sortedSurf = surfData.sort((a, b) => parseFloat(b.swell?.waveHeight ?? '0') - parseFloat(a.swell?.waveHeight ?? '0'));
  const sortedSnow = snowData.sort((a, b) => parseFloat(b.totalSnow) - parseFloat(a.totalSnow));

  return (
    <main style={{ fontFamily: 'sans-serif', background: '#0a0a0a', minHeight: '100vh', color: 'white', padding: '40px' }}>

      <div style={{ borderBottom: '1px solid #222', paddingBottom: '20px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <a href="/" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>← Back to Conditions</a>
          <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: '#00d4ff', margin: '12px 0 0' }}>⚡ Strike Missions</h1>
          <p style={{ fontSize: '18px', color: '#888', marginTop: '8px' }}>Conditions are firing. Here is where to go this week.</p>
        </div>
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '16px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>LIVE DATA</div>
          <div style={{ fontSize: '14px', color: '#00d4ff' }}>Updated hourly</div>
        </div>
      </div>

      <h2 style={{ color: '#00d4ff', marginBottom: '20px' }}>🏄 Surf Strikes</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '48px' }}>
        {sortedSurf.map((spot, i) => (
          <div key={spot.name} style={{
            background: '#111', borderRadius: '16px',
            border: i === 0 ? '1px solid #00d4ff' : '1px solid #222',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #222' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{spot.flag} {spot.name}</div>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{spot.location}</div>
                  <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>{spot.description}</div>
                </div>
                <div style={{
                  background: spot.rating.color + '22', border: `1px solid ${spot.rating.color}`,
                  borderRadius: '6px', padding: '4px 10px', fontSize: '11px',
                  fontWeight: 'bold', color: spot.rating.color, whiteSpace: 'nowrap'
                }}>
                  {spot.rating.label}
                </div>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00d4ff' }}>
                    {spot.swell?.waveHeightFt ? `${spot.swell.waveHeightFt}ft` : 'N/A'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#555' }}>
                    {spot.swell?.waveHeight ? `${spot.swell.waveHeight}m` : ''}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Wave height</div>
                </div>
                <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00d4ff' }}>
                    {spot.swell?.wavePeriod ?? 'N/A'}s
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Period</div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #222', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', color: '#666' }}>Flights from NYC</div>
                  <div style={{ fontWeight: 'bold' }}>~${spot.price}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', color: '#666' }}>5 day trip est.</div>
                  <div style={{ fontWeight: 'bold', color: '#00d4ff' }}>~${spot.tripCost}</div>
                </div>
                <a href={getGoogleFlightsUrl(spot.airportCode)} target="_blank" rel="noopener noreferrer" style={{
                  display: 'block', width: '100%', padding: '12px',
                  background: i === 0 ? '#00d4ff' : '#1a1a1a',
                  color: i === 0 ? '#000' : '#fff',
                  border: i === 0 ? 'none' : '1px solid #333',
                  borderRadius: '8px', fontSize: '14px', fontWeight: 'bold',
                  cursor: 'pointer', textDecoration: 'none', textAlign: 'center' as const,
                  boxSizing: 'border-box' as const
                }}>
                  Search Flights on Google →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ color: '#00d4ff', marginBottom: '20px' }}>🎿 Snow Strikes</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        {sortedSnow.map((resort, i) => (
          <div key={resort.name} style={{
            background: '#111', borderRadius: '16px',
            border: i === 0 ? '1px solid #00d4ff' : '1px solid #222',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #222' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{resort.flag} {resort.name}</div>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{resort.location}</div>
                  <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>{resort.description}</div>
                </div>
                <div style={{
                  background: resort.rating.color + '22', border: `1px solid ${resort.rating.color}`,
                  borderRadius: '6px', padding: '4px 10px', fontSize: '11px',
                  fontWeight: 'bold', color: resort.rating.color, whiteSpace: 'nowrap'
                }}>
                  {resort.rating.label}
                </div>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00d4ff' }}>
                    {(parseFloat(resort.totalSnow) / 2.54).toFixed(1)}"
                  </div>
                  <div style={{ fontSize: '12px', color: '#555' }}>{resort.totalSnow}cm</div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>7 day snow</div>
                </div>
                <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00d4ff' }}>~${resort.hotel}</div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Hotel/night</div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #222', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', color: '#666' }}>Flights from NYC</div>
                  <div style={{ fontWeight: 'bold' }}>~${resort.price}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', color: '#666' }}>5 day trip est.</div>
                  <div style={{ fontWeight: 'bold', color: '#00d4ff' }}>~${resort.tripCost}</div>
                </div>
                <a href={getGoogleFlightsUrl(resort.airportCode)} target="_blank" rel="noopener noreferrer" style={{
                  display: 'block', width: '100%', padding: '12px',
                  background: i === 0 ? '#00d4ff' : '#1a1a1a',
                  color: i === 0 ? '#000' : '#fff',
                  border: i === 0 ? 'none' : '1px solid #333',
                  borderRadius: '8px', fontSize: '14px', fontWeight: 'bold',
                  cursor: 'pointer', textDecoration: 'none', textAlign: 'center' as const,
                  boxSizing: 'border-box' as const
                }}>
                  Search Flights on Google →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

    </main>
  );
}
