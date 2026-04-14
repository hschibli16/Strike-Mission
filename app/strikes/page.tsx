import { getSwellData } from '../stormglass';
import { getSnowForecast } from '../weather';

const SURF_STRIKES = [
  { name: 'Pipeline', location: 'Hawaii', lat: 21.6653, lon: -158.0530, price: 420, hotel: 120, flag: '🇺🇸', description: 'World class barrels on the North Shore', airportCode: 'HNL' },
  { name: 'Supertubes', location: 'Portugal', lat: 37.0869, lon: -8.7986, price: 380, hotel: 60, flag: '🇵🇹', description: 'Powerful beach break, best in Europe', airportCode: 'FAO' },
  { name: 'Uluwatu', location: 'Bali', lat: -8.8291, lon: 115.0849, price: 680, hotel: 35, flag: '🇮🇩', description: 'Legendary reef break at sunset', airportCode: 'DPS' },
  { name: 'Jeffreys Bay', location: 'South Africa', lat: -34.0522, lon: 26.7950, price: 820, hotel: 45, flag: '🇿🇦', description: 'The perfect pointbreak', airportCode: 'PLZ' },
  { name: 'Hossegor', location: 'France', lat: 43.6647, lon: -1.4320, price: 350, hotel: 80, flag: '🇫🇷', description: "Europe's surf capital", airportCode: 'BIQ' },
];

const SNOW_STRIKES = [
  { name: 'Whistler', location: 'Canada', lat: 50.1163, lon: -122.9574, price: 280, hotel: 150, flag: '🇨🇦', description: 'Biggest ski resort in North America', airportCode: 'YVR' },
  { name: 'Snowbird', location: 'Utah', lat: 40.5830, lon: -111.6556, price: 180, hotel: 120, flag: '🇺🇸', description: 'Best powder in the Wasatch', airportCode: 'SLC' },
  { name: 'Niseko', location: 'Japan', lat: 42.8042, lon: 140.6875, price: 780, hotel: 100, flag: '🇯🇵', description: 'Legendary Japanese powder', airportCode: 'CTS' },
];

function getWaveRating(waveHeight: string | null) {
  const h = parseFloat(waveHeight ?? '0');
  if (isNaN(h)) return { label: 'NO DATA', color: '#4a4540' };
  if (h >= 2.5) return { label: 'FIRING', color: '#e8823a' };
  if (h >= 1.5) return { label: 'GOOD', color: '#c8a882' };
  if (h >= 0.8) return { label: 'FAIR', color: '#8a7a6a' };
  return { label: 'SMALL', color: '#4a4540' };
}

function getSnowRating(totalSnow: number) {
  if (totalSnow >= 30) return { label: 'EPIC', color: '#e8823a' };
  if (totalSnow >= 15) return { label: 'GREAT', color: '#c8a882' };
  if (totalSnow >= 5) return { label: 'GOOD', color: '#8a7a6a' };
  return { label: 'THIN', color: '#4a4540' };
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
      const rating = getWaveRating(swell?.waveHeight ?? null);
      const tripCost = spot.price + (spot.hotel * 5);
      return { ...spot, swell, rating, tripCost };
    })
  );

  const snowData = await Promise.all(
    SNOW_STRIKES.map(async (resort) => {
      const forecast = await getSnowForecast(resort.lat, resort.lon);
      const totalSnowCm = forecast.daily.snowfall_sum.reduce((a: number, b: number) => a + b, 0);
      const totalSnowIn = (totalSnowCm / 2.54).toFixed(1);
      const rating = getSnowRating(totalSnowCm);
      const tripCost = resort.price + (resort.hotel * 5);
      return { ...resort, totalSnowCm: totalSnowCm.toFixed(1), totalSnowIn, rating, tripCost };
    })
  );

  const sortedSurf = surfData.sort((a, b) => parseFloat(b.swell?.waveHeight ?? '0') - parseFloat(a.swell?.waveHeight ?? '0'));
  const sortedSnow = snowData.sort((a, b) => parseFloat(b.totalSnowCm) - parseFloat(a.totalSnowCm));

  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#0a0808', minHeight: '100vh', color: '#f0ebe0' }}>

      {/* NAV */}
      <nav style={{
        padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #1a1510'
      }}>
        <a href="/" style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase', color: '#f0ebe0', textDecoration: 'none' }}>
          ⚡ Strike Mission
        </a>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <a href="/" style={{ color: '#6b6560', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase' }}>Conditions</a>
          <a href="/strikes" style={{
            color: '#0a0808', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px',
            textTransform: 'uppercase', background: '#e8823a', padding: '10px 20px', borderRadius: '2px', fontWeight: 'bold'
          }}>Strike Missions</a>
        </div>
      </nav>

      {/* HERO BANNER */}
      <div style={{ position: 'relative', height: '340px', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1800&q=80"
          alt="Surfer"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35) contrast(1.15)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, #0a0808)' }}/>
        <div style={{ position: 'absolute', bottom: '48px', left: '60px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '12px' }}>
            Conditions are firing
          </div>
          <h1 style={{ fontSize: '64px', fontWeight: 'bold', margin: 0, letterSpacing: '-2px', lineHeight: 1 }}>
            STRIKE MISSIONS
          </h1>
          <p style={{ color: '#6b6560', marginTop: '12px', fontSize: '16px' }}>
            Real data. Real trips. Go score.
          </p>
        </div>
      </div>

      <div style={{ padding: '60px' }}>

        {/* SURF STRIKES */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '8px' }}>This week</div>
              <h2 style={{ fontSize: '40px', fontWeight: 'bold', margin: 0, letterSpacing: '-1px' }}>🏄 Surf Strikes</h2>
            </div>
            <div style={{ fontSize: '13px', color: '#4a4540', letterSpacing: '1px' }}>LIVE · Updated hourly</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
            {sortedSurf.slice(0, 3).map((spot, i) => (
              <div key={spot.name} style={{
                background: '#111010',
                borderTop: i === 0 ? '2px solid #e8823a' : '2px solid #1a1510',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '180px', overflow: 'hidden', position: 'relative',
                  background: '#1a1410'
                }}>
                  <img
                    src={[
                      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=80',
                      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&q=80',
                      'https://images.unsplash.com/photo-1455729552865-3658a5d39692?w=600&q=80',
                    ][i]}
                    alt={spot.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6) contrast(1.1)' }}
                  />
                  <div style={{
                    position: 'absolute', top: '16px', left: '16px',
                    background: spot.rating.color, color: i === 0 ? '#0a0808' : '#f0ebe0',
                    fontSize: '10px', letterSpacing: '2px', padding: '4px 10px', fontWeight: 'bold'
                  }}>
                    {spot.rating.label}
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f0ebe0' }}>{spot.flag} {spot.name}</div>
                      <div style={{ fontSize: '12px', color: '#4a4540', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '4px' }}>{spot.location}</div>
                      <div style={{ fontSize: '13px', color: '#6b6560', marginTop: '6px' }}>{spot.description}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ background: '#0a0808', padding: '12px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '22px', fontWeight: 'bold', color: i === 0 ? '#e8823a' : '#f0ebe0' }}>
                        {spot.swell?.waveHeightFt ?? 'N/A'}<span style={{ fontSize: '12px' }}>ft</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#4a4540', marginTop: '2px' }}>{spot.swell?.waveHeight ?? '—'}m</div>
                      <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Height</div>
                    </div>
                    <div style={{ background: '#0a0808', padding: '12px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f0ebe0' }}>
                        {spot.swell?.wavePeriod ?? 'N/A'}<span style={{ fontSize: '12px' }}>s</span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Period</div>
                    </div>
                    <div style={{ background: '#0a0808', padding: '12px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f0ebe0' }}>
                        {spot.swell?.windSpeed ?? 'N/A'}<span style={{ fontSize: '12px' }}>kts</span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Wind</div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #1a1510', paddingTop: '20px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#4a4540' }}>Flights from NYC</span>
                      <span style={{ fontWeight: 'bold', color: '#f0ebe0' }}>~${spot.price}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#4a4540' }}>5 day trip est.</span>
                      <span style={{ fontWeight: 'bold', color: '#e8823a', fontSize: '18px' }}>~${spot.tripCost}</span>
                    </div>
                  </div>

                  <a href={getGoogleFlightsUrl(spot.airportCode)} target="_blank" rel="noopener noreferrer" style={{
                    display: 'block', width: '100%', padding: '14px',
                    background: i === 0 ? '#e8823a' : 'transparent',
                    color: i === 0 ? '#0a0808' : '#f0ebe0',
                    border: i === 0 ? 'none' : '1px solid #2a2520',
                    fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px',
                    textTransform: 'uppercase', textDecoration: 'none',
                    textAlign: 'center' as const, cursor: 'pointer', boxSizing: 'border-box' as const
                  }}>
                    Book This Strike →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SNOW STRIKES */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '8px' }}>This week</div>
              <h2 style={{ fontSize: '40px', fontWeight: 'bold', margin: 0, letterSpacing: '-1px' }}>🎿 Snow Strikes</h2>
            </div>
            <div style={{ fontSize: '13px', color: '#4a4540', letterSpacing: '1px' }}>7-DAY FORECAST</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
            {sortedSnow.map((resort, i) => (
              <div key={resort.name} style={{
                background: '#111010',
                borderTop: i === 0 ? '2px solid #e8823a' : '2px solid #1a1510',
                overflow: 'hidden'
              }}>
                <div style={{ height: '180px', overflow: 'hidden', position: 'relative', background: '#1a1410' }}>
                  <img
                    src={[
                      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80',
                      'https://images.unsplash.com/photo-1520208422220-d12a3c588e6c?w=600&q=80',
                      'https://images.unsplash.com/photo-1548777123-e216912df7d8?w=600&q=80',
                    ][i]}
                    alt={resort.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55) contrast(1.1)' }}
                  />
                  <div style={{
                    position: 'absolute', top: '16px', left: '16px',
                    background: resort.rating.color, color: i === 0 ? '#0a0808' : '#f0ebe0',
                    fontSize: '10px', letterSpacing: '2px', padding: '4px 10px', fontWeight: 'bold'
                  }}>
                    {resort.rating.label}
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f0ebe0' }}>{resort.flag} {resort.name}</div>
                    <div style={{ fontSize: '12px', color: '#4a4540', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '4px' }}>{resort.location}</div>
                    <div style={{ fontSize: '13px', color: '#6b6560', marginTop: '6px' }}>{resort.description}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ background: '#0a0808', padding: '12px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: i === 0 ? '#e8823a' : '#f0ebe0' }}>
                        {resort.totalSnowIn}<span style={{ fontSize: '14px' }}>&quot;</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#4a4540', marginTop: '2px' }}>{resort.totalSnowCm}cm</div>
                      <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>7 day snow</div>
                    </div>
                    <div style={{ background: '#0a0808', padding: '12px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f0ebe0' }}>
                        ~${resort.hotel}
                      </div>
                      <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Hotel/night</div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #1a1510', paddingTop: '20px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#4a4540' }}>Flights from NYC</span>
                      <span style={{ fontWeight: 'bold', color: '#f0ebe0' }}>~${resort.price}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#4a4540' }}>5 day trip est.</span>
                      <span style={{ fontWeight: 'bold', color: '#e8823a', fontSize: '18px' }}>~${resort.tripCost}</span>
                    </div>
                  </div>

                  <a href={getGoogleFlightsUrl(resort.airportCode)} target="_blank" rel="noopener noreferrer" style={{
                    display: 'block', width: '100%', padding: '14px',
                    background: i === 0 ? '#e8823a' : 'transparent',
                    color: i === 0 ? '#0a0808' : '#f0ebe0',
                    border: i === 0 ? 'none' : '1px solid #2a2520',
                    fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px',
                    textTransform: 'uppercase', textDecoration: 'none',
                    textAlign: 'center' as const, cursor: 'pointer', boxSizing: 'border-box' as const
                  }}>
                    Book This Strike →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
