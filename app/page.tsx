import { getSnowForecast } from './weather';
import { getSwellData } from './stormglass';
import EmailSignup from './EmailSignup';
import Ticker from './components/Ticker';
import TripFinder from './components/TripFinder';
import { FlagIcon } from './components/Icons';

const SKI_RESORTS = [
  { name: 'Whistler', location: 'Canada', country: 'Canada', lat: 50.1163, lon: -122.9574, flag: '🇨🇦' },
  { name: 'Snowbird', location: 'Utah', country: 'USA', lat: 40.5830, lon: -111.6556, flag: '🇺🇸' },
  { name: 'Niseko', location: 'Japan', country: 'Japan', lat: 42.8042, lon: 140.6875, flag: '🇯🇵' },
  { name: 'Chamonix', location: 'France', country: 'France', lat: 45.9237, lon: 6.8694, flag: '🇫🇷' },
  { name: 'Verbier', location: 'Switzerland', country: 'Switzerland', lat: 46.0959, lon: 7.2283, flag: '🇨🇭' },
];

const SURF_SPOTS = [
  { name: 'Pipeline', location: 'Hawaii', country: 'USA', lat: 21.6653, lon: -158.0530, flag: '🇺🇸' },
  { name: 'Supertubes', location: 'Portugal', country: 'Portugal', lat: 37.0869, lon: -8.7986, flag: '🇵🇹' },
  { name: 'Uluwatu', location: 'Bali', country: 'Indonesia', lat: -8.8291, lon: 115.0849, flag: '🇮🇩' },
  { name: 'Hossegor', location: 'France', country: 'France', lat: 43.6647, lon: -1.4320, flag: '🇫🇷' },
  { name: 'Jeffreys Bay', location: 'South Africa', country: 'South Africa', lat: -34.0522, lon: 26.7950, flag: '🇿🇦' },
];

export default async function Home() {
  const snowForecasts = await Promise.all(
    SKI_RESORTS.map(async (resort) => {
      const data = await getSnowForecast(resort.lat, resort.lon);
      const totalSnowCm = data.daily.snowfall_sum.reduce((a: number, b: number) => a + b, 0);
      const totalSnowIn = (totalSnowCm / 2.54).toFixed(1);
      return { ...resort, totalSnowCm: totalSnowCm.toFixed(1), totalSnowIn };
    })
  );

  const surfForecasts = await Promise.all(
    SURF_SPOTS.map(async (spot) => {
      const swell = await getSwellData(spot.lat, spot.lon);
      return { ...spot, swell };
    })
  );

  const sortedSnow = snowForecasts.sort((a, b) => parseFloat(b.totalSnowCm) - parseFloat(a.totalSnowCm));
  const sortedSurf = surfForecasts.sort((a, b) => parseFloat(b.swell?.waveHeight ?? '0') - parseFloat(a.swell?.waveHeight ?? '0'));

  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#0a0808', minHeight: '100vh', color: '#f0ebe0' }}>
      <style>{`
  .home-conditions-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 2px; margin-bottom: 80px; }
  .home-padding { padding: 80px 60px; }
  .home-hero-title { font-size: 88px; font-weight: bold; line-height: 1; margin: 0 0 24px; letter-spacing: -2px; color: #f0ebe0; text-shadow: 0 2px 40px rgba(0,0,0,0.8); }
  .home-hero-bottom { position: absolute; bottom: 80px; left: 60px; right: 60px; }
  .home-cta-banner { background: #1a1410; border: 1px solid #2a2520; padding: 48px; display: flex; justify-content: space-between; align-items: center; }
  @media (max-width: 768px) {
    .home-conditions-grid { grid-template-columns: 1fr !important; }
    .home-padding { padding: 24px 20px !important; }
    .home-hero-title { font-size: 42px !important; letter-spacing: -1px !important; }
    .home-hero-bottom { bottom: 24px !important; left: 20px !important; right: 20px !important; }
    .home-cta-banner { flex-direction: column !important; gap: 20px !important; padding: 28px !important; }
  }
`}</style>
      
      <Ticker items={[
        { label: 'Pipeline', value: `${sortedSurf[0]?.swell?.waveHeightFt ?? 'N/A'}ft`, type: 'surf' },
        { label: 'Supertubes', value: `${sortedSurf[1]?.swell?.waveHeightFt ?? 'N/A'}ft`, type: 'surf' },
        { label: 'Hossegor', value: `${sortedSurf[2]?.swell?.waveHeightFt ?? 'N/A'}ft`, type: 'surf' },
        { label: 'Whistler', value: `${sortedSnow[0]?.totalSnowIn ?? 'N/A'}"`, type: 'ski' },
        { label: 'Snowbird', value: `${sortedSnow[1]?.totalSnowIn ?? 'N/A'}"`, type: 'ski' },
        { label: 'Niseko', value: `${sortedSnow[2]?.totalSnowIn ?? 'N/A'}"`, type: 'ski' },
      ]} />

      {/* NAV */}
      <nav style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(10,8,8,0.97)',
        borderBottom: '1px solid #1a1510',
      }}>
        <img src="/logo.svg" alt="Strike Mission" style={{ height: '48px' }} />
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <a href="/" style={{ color: '#f0ebe0', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase' }}>Conditions</a>
          <a href="/hotlist" style={{ color: '#6b6560', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase' }}>Hot List</a>
          <a href="/about" style={{ color: '#6b6560', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase' }}>About</a>
          <a href="/strikes" style={{
            color: '#0a0808', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px',
            textTransform: 'uppercase', background: '#e8823a', padding: '10px 20px', borderRadius: '2px', fontWeight: 'bold'
          }}>Strike Missions</a>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1800&q=80"
          alt="Big wave surfing"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.45) contrast(1.1)' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 40%, #0a0808 100%)'
        }}/>
        <div className="home-hero-bottom">
          <div style={{ fontSize: '13px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '16px' }}>
            Real-time conditions · Last-minute trips
          </div>
          <h1 className="home-hero-title">
            STRIKE<br/>MISSION
          </h1>
          <p style={{ fontSize: '20px', color: '#b0a898', maxWidth: '500px', lineHeight: 1.6, marginBottom: '32px' }}>
            The world's best waves and powder — ranked by real conditions, booked in minutes.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="/strikes" style={{
              display: 'inline-block', padding: '16px 32px', background: '#e8823a',
              color: '#0a0808', textDecoration: 'none', fontWeight: 'bold',
              fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', borderRadius: '2px'
            }}>
              This Week's Strikes →
            </a>
            <a href="#conditions" style={{
              display: 'inline-block', padding: '16px 32px',
              border: '1px solid rgba(240,235,224,0.3)', color: '#f0ebe0',
              textDecoration: 'none', fontSize: '14px', letterSpacing: '2px',
              textTransform: 'uppercase', borderRadius: '2px'
            }}>
              Live Conditions
            </a>
          </div>
        </div>
      </div>

      {/* CONDITIONS SECTION */}
      <div id="conditions" className="home-padding">
        
        <div style={{ marginBottom: '64px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '12px' }}>
            Live surf conditions
          </div>
          <h2 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 8px', letterSpacing: '-1px' }}>
            🏄 Waves Right Now
          </h2>
          <p style={{ color: '#6b6560', fontSize: '15px' }}>Offshore wave models · Updated hourly · Heights in ft (m)</p>
        </div>

        <div className="home-conditions-grid">
          {sortedSurf.map((spot, i) => (
            <div key={spot.name} style={{
              background: i === 0 ? '#1a1410' : '#111010',
              padding: '28px 24px',
              borderTop: i === 0 ? '2px solid #e8823a' : '2px solid #2a2520',
              position: 'relative'
            }}>
              {i === 0 && (
                <div style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: '#e8823a', color: '#0a0808', fontSize: '9px',
                  letterSpacing: '2px', textTransform: 'uppercase', padding: '3px 8px', fontWeight: 'bold'
                }}>
                  Best
                </div>
              )}
              <div style={{ fontSize: '22px', marginBottom: '8px' }}><FlagIcon country={spot.country} size={16} /></div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '2px', color: '#f0ebe0' }}>{spot.name}</div>
              <div style={{ fontSize: '12px', color: '#6b6560', marginBottom: '20px', letterSpacing: '1px', textTransform: 'uppercase' }}>{spot.location}</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: i === 0 ? '#e8823a' : '#f0ebe0', lineHeight: 1 }}>
                {spot.swell?.waveHeightFt ?? 'N/A'}<span style={{ fontSize: '16px' }}>ft</span>
              </div>
              <div style={{ fontSize: '13px', color: '#6b6560', marginTop: '4px' }}>
                {spot.swell?.waveHeight ?? '—'}m · {spot.swell?.wavePeriod ?? '—'}s
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '64px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '12px' }}>
            Live snow conditions
          </div>
          <h2 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 8px', letterSpacing: '-1px' }}>
            🎿 Snow Right Now
          </h2>
          <p style={{ color: '#6b6560', fontSize: '15px' }}>7-day snowfall forecast · Heights in inches (cm)</p>
        </div>

        <div className="home-conditions-grid">
          {sortedSnow.map((resort, i) => (
            <div key={resort.name} style={{
              background: i === 0 ? '#1a1410' : '#111010',
              padding: '28px 24px',
              borderTop: i === 0 ? '2px solid #e8823a' : '2px solid #2a2520',
              position: 'relative'
            }}>
              {i === 0 && (
                <div style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: '#e8823a', color: '#0a0808', fontSize: '9px',
                  letterSpacing: '2px', textTransform: 'uppercase', padding: '3px 8px', fontWeight: 'bold'
                }}>
                  Best
                </div>
              )}
              <div style={{ fontSize: '22px', marginBottom: '8px' }}><FlagIcon country={resort.country} size={16} /></div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '2px', color: '#f0ebe0' }}>{resort.name}</div>
              <div style={{ fontSize: '12px', color: '#6b6560', marginBottom: '20px', letterSpacing: '1px', textTransform: 'uppercase' }}>{resort.location}</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: i === 0 ? '#e8823a' : '#f0ebe0', lineHeight: 1 }}>
                {resort.totalSnowIn}<span style={{ fontSize: '16px' }}></span>
              </div>
              <div style={{ fontSize: '13px', color: '#6b6560', marginTop: '4px' }}>{resort.totalSnowCm}cm · 7 days</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '0 60px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '8px' }}>Personalized for you</div>
          <h2 style={{ fontSize: '44px', fontWeight: 'bold', margin: '0 0 24px', letterSpacing: '-1px' }}>Find your strike mission</h2>
          <p style={{ color: '#6b6560', fontSize: '16px', marginBottom: '32px', maxWidth: '600px' }}>
            Tell us what you are chasing and we will match you to the best trips available right now based on live conditions, your skill level, and your budget.
          </p>
        </div>

        <TripFinder spots={[...sortedSurf.map(s => ({ ...s, type: 'surf' })), ...sortedSnow.map(s => ({ ...s, type: 'ski' }))]} />

        {/* EMAIL SIGNUP */}
        <div style={{ background: '#111010', borderTop: '2px solid #e8823a', padding: '48px', marginBottom: '2px' }}>
          <div style={{ maxWidth: '560px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '12px' }}>
              Don't miss a strike
            </div>
            <h3 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 12px', letterSpacing: '-1px' }}>
              Get alerted when conditions fire
            </h3>
            <p style={{ color: '#6b6560', fontSize: '15px', marginBottom: '24px' }}>
              We scan the world's best surf and ski spots daily. When something is firing, you'll be the first to know.
            </p>
            <EmailSignup />
          </div>
        </div>

        {/* CTA BANNER */}
        <div className="home-cta-banner">
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '12px' }}>
              Ready to go?
            </div>
            <h3 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, letterSpacing: '-1px' }}>
              See this week's bookable strike missions
            </h3>
          </div>
          <a href="/strikes" style={{
            display: 'inline-block', padding: '18px 40px', background: '#e8823a',
            color: '#0a0808', textDecoration: 'none', fontWeight: 'bold',
            fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase',
            borderRadius: '2px', whiteSpace: 'nowrap' as const
          }}>
            View Strikes →
          </a>
        </div>

      </div>
    </main>
  );
}
