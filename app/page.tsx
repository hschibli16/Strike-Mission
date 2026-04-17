import { getSnowForecast } from './weather';
import { getSwellData } from './stormglass';
import { SURF_SPOTS, SKI_RESORTS } from './spots';
import { scoreSurfSpot, scoreSkiSpot, getStrikeLabel, getSkiLabel } from './scoring';
import Ticker from './components/Ticker';
import MobileNav from './components/MobileNav';
import SearchBar from './components/SearchBar';
import EmailSignup from './EmailSignup';

export default async function Home() {
  const surfForecasts = await Promise.all(
    SURF_SPOTS.slice(0, 8).map(async (spot) => {
      const swell = await getSwellData(spot.lat, spot.lon);
      const score = scoreSurfSpot({
        waveHeight: swell?.waveHeightFt ?? null,
        wavePeriod: swell?.wavePeriod ?? null,
        swellDirection: swell?.swellDirection ?? null,
        windDirection: swell?.windDirection ?? null,
        windSpeed: swell?.windSpeed ?? null,
        idealSwellDirection: spot.idealSwellDirection,
        idealWindDirection: spot.idealWindDirection,
        bestMonths: spot.bestMonths,
        flightPrice: spot.flightPrice,
      });
      const strike = getStrikeLabel(score);
      return { ...spot, swell, score, strike };
    })
  );

  const snowForecasts = await Promise.all(
    SKI_RESORTS.slice(0, 6).map(async (resort) => {
      const forecast = await getSnowForecast(resort.lat, resort.lon);
      const totalSnowCm = forecast.consensus
        ? parseFloat(forecast.consensus.totalSnowCm)
        : forecast.daily.snowfall_sum.reduce((a: number, b: number) => a + b, 0);
      const totalSnowIn = (totalSnowCm / 2.54).toFixed(1);
      const score = scoreSkiSpot({
        totalSnowCm,
        bestMonths: resort.bestMonths,
        flightPrice: resort.flightPrice,
      });
      const strike = getSkiLabel(score);
      return { ...resort, totalSnowCm: totalSnowCm.toFixed(1), totalSnowIn, score, strike };
    })
  );

  const topSurf = surfForecasts.sort((a, b) => b.score - a.score).slice(0, 3);
  const topSnow = snowForecasts.sort((a, b) => b.score - a.score).slice(0, 3);

  const tickerItems = [
    ...topSurf.map(s => ({ label: s.name, value: `${s.swell?.waveHeightFt ?? 'N/A'}ft`, type: 'surf' as const })),
    ...topSnow.map(s => ({ label: s.name, value: `${s.totalSnowIn}"`, type: 'ski' as const })),
  ];

  function getGoogleFlightsUrl(airportCode: string) {
    const today = new Date();
    const friday = new Date(today);
    friday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));
    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 9);
    const fmt = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '');
    return `https://www.google.com/flights/#search;f=JFK;t=${airportCode};d=${fmt(friday)};r=${fmt(sunday)};tt=r`;
  }

  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#0a0808', minHeight: '100vh', color: '#f0ebe0' }}>

      {/* TICKER */}
      <Ticker items={tickerItems} />

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(10,8,8,0.97)', borderBottom: '1px solid #1a1510'
      }}>
        <a href="/" style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase', color: '#f0ebe0', textDecoration: 'none' }}>
          Strike Mission
        </a>
        <MobileNav />
      </nav>

      {/* HERO */}
      <div style={{ position: 'relative', height: '92vh', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1800&q=80"
          alt="Strike Mission"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.4) contrast(1.1)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, #0a0808 100%)' }}/>
        <div style={{ position: 'absolute', bottom: '80px', left: '60px', right: '60px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.6, marginBottom: '16px' }}>
            The ultimate travel guide for surfers and skiers
          </div>
          <h1 style={{ fontSize: '80px', fontWeight: 'bold', lineHeight: 1, margin: '0 0 24px', letterSpacing: '-3px', color: '#f0ebe0' }}>
            STRIKE<br/>MISSION
          </h1>
          <p style={{ fontSize: '18px', color: '#b0a898', maxWidth: '480px', lineHeight: 1.6, marginBottom: '32px' }}>
            Real-time conditions. Expert trip planning. Book your next wave or powder day in minutes.
          </p>
          <SearchBar placeholder="Search any surf or ski spot worldwide..." />
          <div style={{ marginTop: '16px', fontSize: '13px', color: '#4a4540' }}>
            <a href="/guide" style={{ color: '#f0ebe0', textDecoration: 'none', opacity: 0.6 }}>Browse all destinations →</a>
            <span style={{ margin: '0 12px', opacity: 0.3 }}>·</span>
            <a href="/hotlist" style={{ color: '#f0ebe0', textDecoration: 'none', opacity: 0.6 }}>See what&apos;s firing now →</a>
          </div>
        </div>
      </div>

      {/* BOOK THESE TRIPS NOW */}
      <div style={{ padding: '80px 60px' }}>
        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.5, marginBottom: '12px' }}>
            Conditions are firing right now
          </div>
          <h2 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 8px', letterSpacing: '-2px' }}>
            Book These Trips Now
          </h2>
          <p style={{ color: '#6b6560', fontSize: '16px' }}>
            Based on live forecasts — these are the best trips available this week
          </p>
        </div>

        {/* SURF TRIPS */}
        <div style={{ marginBottom: '64px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.4, marginBottom: '24px' }}>
            Surf
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
            {topSurf.map((spot, i) => (
              <div key={spot.slug} style={{
                background: '#111010',
                borderTop: i === 0 ? '2px solid #f0ebe0' : '1px solid #1a1510',
                overflow: 'hidden',
              }}>
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                  <img
                    src={[
                      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=80',
                      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&q=80',
                      'https://images.unsplash.com/photo-1455729552865-3658a5d39692?w=600&q=80',
                    ][i]}
                    alt={spot.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55)' }}
                  />
                  <div style={{
                    position: 'absolute', top: '12px', left: '12px',
                    background: spot.strike.bg, color: spot.strike.color,
                    fontSize: '10px', letterSpacing: '2px', padding: '3px 10px', fontWeight: 'bold',
                  }}>
                    {spot.strike.label}
                  </div>
                  {i === 0 && (
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      background: '#f0ebe0', color: '#0a0808',
                      fontSize: '10px', letterSpacing: '2px', padding: '3px 10px', fontWeight: 'bold',
                    }}>
                      #1 THIS WEEK
                    </div>
                  )}
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '4px' }}>{spot.name}</div>
                  <div style={{ fontSize: '12px', color: '#4a4540', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>{spot.location}</div>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{spot.swell?.waveHeightFt ?? 'N/A'}<span style={{ fontSize: '13px' }}>ft</span></div>
                      <div style={{ fontSize: '11px', color: '#4a4540', textTransform: 'uppercase', letterSpacing: '1px' }}>Waves</div>
                    </div>
                    <div style={{ width: '1px', background: '#1a1510' }}/>
                    <div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{spot.swell?.wavePeriod ?? 'N/A'}<span style={{ fontSize: '13px' }}>s</span></div>
                      <div style={{ fontSize: '11px', color: '#4a4540', textTransform: 'uppercase', letterSpacing: '1px' }}>Period</div>
                    </div>
                    <div style={{ width: '1px', background: '#1a1510' }}/>
                    <div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>~${spot.flightPrice + spot.hotelPrice * 5}</div>
                      <div style={{ fontSize: '11px', color: '#4a4540', textTransform: 'uppercase', letterSpacing: '1px' }}>5 day est.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a href={`/spot/${spot.slug}`} style={{
                      flex: 1, padding: '12px', background: 'transparent',
                      border: '1px solid #2a2520', color: '#f0ebe0',
                      textDecoration: 'none', fontSize: '11px', fontWeight: 'bold',
                      letterSpacing: '2px', textTransform: 'uppercase', textAlign: 'center' as const,
                    }}>
                      Trip Guide
                    </a>
                    <a href={getGoogleFlightsUrl(spot.airportCode)} target="_blank" rel="noopener noreferrer" style={{
                      flex: 1, padding: '12px',
                      background: i === 0 ? '#f0ebe0' : 'transparent',
                      border: i === 0 ? 'none' : '1px solid #2a2520',
                      color: i === 0 ? '#0a0808' : '#f0ebe0',
                      textDecoration: 'none', fontSize: '11px', fontWeight: 'bold',
                      letterSpacing: '2px', textTransform: 'uppercase', textAlign: 'center' as const,
                    }}>
                      Book Now
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SNOW TRIPS */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.4, marginBottom: '24px' }}>
            Ski
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
            {topSnow.map((resort, i) => (
              <div key={resort.slug} style={{
                background: '#111010',
                borderTop: i === 0 ? '2px solid #f0ebe0' : '1px solid #1a1510',
                overflow: 'hidden',
              }}>
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                  <img
                    src={[
                      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80',
                      'https://images.unsplash.com/photo-1520208422220-d12a3c588e6c?w=600&q=80',
                      'https://images.unsplash.com/photo-1548777123-e216912df7d8?w=600&q=80',
                    ][i]}
                    alt={resort.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55)' }}
                  />
                  <div style={{
                    position: 'absolute', top: '12px', left: '12px',
                    background: resort.strike.bg, color: resort.strike.color,
                    fontSize: '10px', letterSpacing: '2px', padding: '3px 10px', fontWeight: 'bold',
                  }}>
                    {resort.strike.label}
                  </div>
                  {i === 0 && (
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      background: '#f0ebe0', color: '#0a0808',
                      fontSize: '10px', letterSpacing: '2px', padding: '3px 10px', fontWeight: 'bold',
                    }}>
                      #1 THIS WEEK
                    </div>
                  )}
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '4px' }}>{resort.name}</div>
                  <div style={{ fontSize: '12px', color: '#4a4540', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>{resort.location}</div>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{resort.totalSnowIn}<span style={{ fontSize: '13px' }}>&quot;</span></div>
                      <div style={{ fontSize: '11px', color: '#4a4540', textTransform: 'uppercase', letterSpacing: '1px' }}>Snow</div>
                    </div>
                    <div style={{ width: '1px', background: '#1a1510' }}/>
                    <div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>~${resort.flightPrice}</div>
                      <div style={{ fontSize: '11px', color: '#4a4540', textTransform: 'uppercase', letterSpacing: '1px' }}>Flights</div>
                    </div>
                    <div style={{ width: '1px', background: '#1a1510' }}/>
                    <div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>~${resort.flightPrice + resort.hotelPrice * 5}</div>
                      <div style={{ fontSize: '11px', color: '#4a4540', textTransform: 'uppercase', letterSpacing: '1px' }}>5 day est.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a href={`/spot/${resort.slug}`} style={{
                      flex: 1, padding: '12px', background: 'transparent',
                      border: '1px solid #2a2520', color: '#f0ebe0',
                      textDecoration: 'none', fontSize: '11px', fontWeight: 'bold',
                      letterSpacing: '2px', textTransform: 'uppercase', textAlign: 'center' as const,
                    }}>
                      Trip Guide
                    </a>
                    <a href={getGoogleFlightsUrl(resort.airportCode)} target="_blank" rel="noopener noreferrer" style={{
                      flex: 1, padding: '12px',
                      background: i === 0 ? '#f0ebe0' : 'transparent',
                      border: i === 0 ? 'none' : '1px solid #2a2520',
                      color: i === 0 ? '#0a0808' : '#f0ebe0',
                      textDecoration: 'none', fontSize: '11px', fontWeight: 'bold',
                      letterSpacing: '2px', textTransform: 'uppercase', textAlign: 'center' as const,
                    }}>
                      Book Now
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SIGN UP CTA */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', marginBottom: '80px' }}>
          <div style={{ background: '#111010', padding: '48px', borderTop: '2px solid #f0ebe0' }}>
            <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.5, marginBottom: '16px' }}>Free</div>
            <h3 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 16px', letterSpacing: '-1px' }}>Guest Access</h3>
            <p style={{ color: '#6b6560', marginBottom: '32px', lineHeight: 1.7 }}>Browse conditions, explore destinations, and plan your trip with basic tools.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', color: '#b0a898' }}>
              {['Live conditions for all spots', 'Basic trip guides', '3-day forecast', 'Google Flights search'].map(f => (
                <li key={f} style={{ padding: '8px 0', borderBottom: '1px solid #1a1510', fontSize: '14px' }}>✓ {f}</li>
              ))}
            </ul>
            <a href="/guide" style={{
              display: 'block', padding: '14px', background: 'transparent',
              border: '1px solid #2a2520', color: '#f0ebe0',
              textDecoration: 'none', fontSize: '12px', fontWeight: 'bold',
              letterSpacing: '2px', textTransform: 'uppercase', textAlign: 'center' as const,
            }}>
              Continue as Guest →
            </a>
          </div>
          <div style={{ background: '#f0ebe0', padding: '48px', borderTop: '2px solid #f0ebe0' }}>
            <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#0a0808', opacity: 0.5, marginBottom: '16px' }}>Premium — Coming Soon</div>
            <h3 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 16px', letterSpacing: '-1px', color: '#0a0808' }}>Strike Member</h3>
            <p style={{ color: '#4a4540', marginBottom: '32px', lineHeight: 1.7 }}>The full experience — personalized alerts, extended forecasts, and one-click trip booking.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', color: '#2a2520' }}>
              {['Everything in Guest', '16-day extended forecast', 'Personal alerts when spots fire', 'One-click trip booking', 'Personalized recommendations', 'Unlimited trip guides'].map(f => (
                <li key={f} style={{ padding: '8px 0', borderBottom: '1px solid #2a252044', fontSize: '14px', color: '#0a0808' }}>✓ {f}</li>
              ))}
            </ul>
            <div style={{ padding: '14px', background: '#0a0808', color: '#f0ebe0', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', textAlign: 'center' as const }}>
              Join Waitlist
            </div>
          </div>
        </div>

        {/* EMAIL SIGNUP */}
        <div style={{ maxWidth: '600px', marginBottom: '80px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.5, marginBottom: '12px' }}>Stay in the loop</div>
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 12px', letterSpacing: '-1px' }}>Get the weekly Hot List</h3>
          <p style={{ color: '#6b6560', marginBottom: '24px' }}>Top 5 surf and ski strikes every Monday morning.</p>
          <EmailSignup />
        </div>

      </div>
    </main>
  );
}
