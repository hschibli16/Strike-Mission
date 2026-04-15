import { SURF_SPOTS, SKI_RESORTS } from '../spots';
import { getSwellData } from '../stormglass';
import { getSnowForecast } from '../weather';
import { scoreSurfSpot, scoreSkiSpot, getStrikeLabel } from '../scoring';

export default async function HotList() {
  const surfScored = await Promise.all(
    SURF_SPOTS.map(async (spot) => {
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

  const snowScored = await Promise.all(
    SKI_RESORTS.map(async (resort) => {
      const forecast = await getSnowForecast(resort.lat, resort.lon);
      const totalSnowCm = forecast.daily.snowfall_sum.reduce((a: number, b: number) => a + b, 0);
      const score = scoreSkiSpot({
        totalSnowCm,
        bestMonths: resort.bestMonths,
        flightPrice: resort.flightPrice,
      });
      const strike = getStrikeLabel(score);
      return { ...resort, totalSnowCm: totalSnowCm.toFixed(1), totalSnowIn: (totalSnowCm / 2.54).toFixed(1), score, strike };
    })
  );

  const top5Surf = surfScored.sort((a, b) => b.score - a.score).slice(0, 5);
  const top5Snow = snowScored.sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#0a0808', minHeight: '100vh', color: '#f0ebe0' }}>
      <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1a1510' }}>
        <a href="/" style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase', color: '#f0ebe0', textDecoration: 'none' }}>Strike Mission</a>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <a href="/" style={{ color: '#6b6560', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase' }}>Conditions</a>
          <a href="/hotlist" style={{ color: '#e8823a', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>Hot List</a>
          <a href="/about" style={{ color: '#6b6560', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase' }}>About</a>
          <a href="/strikes" style={{ color: '#0a0808', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', background: '#e8823a', padding: '10px 20px', borderRadius: '2px', fontWeight: 'bold' }}>Book a Strike</a>
        </div>
      </nav>

      <div style={{ position: 'relative', height: '320px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1800&q=80" alt="Hot List" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3) contrast(1.2)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, #0a0808)' }} />
        <div style={{ position: 'absolute', bottom: '48px', left: '60px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '12px' }}>Updated weekly · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          <h1 style={{ fontSize: '72px', fontWeight: 'bold', margin: '0 0 12px', letterSpacing: '-2px', lineHeight: 1 }}>THE HOT LIST</h1>
          <p style={{ color: '#b0a898', fontSize: '18px', margin: 0 }}>The world's top 5 surf and ski strikes right now — ranked by live conditions, forecast, and value.</p>
        </div>
      </div>

      <div style={{ padding: '60px' }}>
        <div style={{ marginBottom: '80px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '8px' }}>Top 5 worldwide</div>
          <h2 style={{ fontSize: '44px', fontWeight: 'bold', margin: '0 0 40px', letterSpacing: '-1px' }}>Surf Strikes</h2>
          {top5Surf.map((spot, i) => (
            <a key={spot.slug} href={`/spot/${spot.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: '32px', alignItems: 'center', padding: '28px 0', borderBottom: '1px solid #1a1510', borderTop: i === 0 ? '1px solid #1a1510' : 'none' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold', lineHeight: 1, color: i === 0 ? '#e8823a' : '#2a2520' }}>{String(i + 1).padStart(2, '0')}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#f0ebe0' }}>{spot.name}</span>
                    <span style={{ background: spot.strike.color + '22', border: `1px solid ${spot.strike.color}`, color: spot.strike.color, fontSize: '10px', letterSpacing: '2px', padding: '3px 10px', fontWeight: 'bold' }}>{spot.strike.label}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>{spot.location}</div>
                  <div style={{ fontSize: '14px', color: '#6b6560' }}>{spot.tagline}</div>
                </div>
                <div style={{ textAlign: 'right' as const }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: i === 0 ? '#e8823a' : '#f0ebe0' }}>{spot.swell?.waveHeightFt ?? 'N/A'}<span style={{ fontSize: '16px' }}>ft</span></div>
                  <div style={{ fontSize: '12px', color: '#4a4540', marginTop: '4px' }}>{spot.swell?.waveHeight ?? '—'}m · {spot.swell?.wavePeriod ?? '—'}s</div>
                  <div style={{ fontSize: '12px', color: '#4a4540', marginTop: '4px' }}>Strike score: {spot.score}/70</div>
                  <div style={{ fontSize: '13px', color: '#e8823a', marginTop: '8px', fontWeight: 'bold' }}>~${spot.flightPrice + spot.hotelPrice * 5} est. →</div>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div>
          <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '8px' }}>Top 5 worldwide</div>
          <h2 style={{ fontSize: '44px', fontWeight: 'bold', margin: '0 0 40px', letterSpacing: '-1px' }}>Snow Strikes</h2>
          {top5Snow.map((resort, i) => (
            <a key={resort.slug} href={`/spot/${resort.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: '32px', alignItems: 'center', padding: '28px 0', borderBottom: '1px solid #1a1510', borderTop: i === 0 ? '1px solid #1a1510' : 'none' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold', lineHeight: 1, color: i === 0 ? '#e8823a' : '#2a2520' }}>{String(i + 1).padStart(2, '0')}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#f0ebe0' }}>{resort.name}</span>
                    <span style={{ background: resort.strike.color + '22', border: `1px solid ${resort.strike.color}`, color: resort.strike.color, fontSize: '10px', letterSpacing: '2px', padding: '3px 10px', fontWeight: 'bold' }}>{resort.strike.label}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>{resort.location}</div>
                  <div style={{ fontSize: '14px', color: '#6b6560' }}>{resort.tagline}</div>
                </div>
                <div style={{ textAlign: 'right' as const }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: i === 0 ? '#e8823a' : '#f0ebe0' }}>{resort.totalSnowIn}<span style={{ fontSize: '16px' }}>&quot;</span></div>
                  <div style={{ fontSize: '12px', color: '#4a4540', marginTop: '4px' }}>{resort.totalSnowCm}cm · 7 days</div>
                  <div style={{ fontSize: '12px', color: '#4a4540', marginTop: '4px' }}>Strike score: {resort.score}/70</div>
                  <div style={{ fontSize: '13px', color: '#e8823a', marginTop: '8px', fontWeight: 'bold' }}>~${resort.flightPrice + resort.hotelPrice * 5} est. →</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
