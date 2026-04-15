import { ALL_SPOTS } from '../../spots';
import { getSwellData } from '../../stormglass';
import { getSnowForecast } from '../../weather';
import { FlagIcon } from '../../components/Icons';

function getGoogleFlightsUrl(airportCode: string) {
  const today = new Date();
  const friday = new Date(today);
  friday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));
  const sunday = new Date(friday);
  sunday.setDate(friday.getDate() + 9);
  const fmt = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '');
  return `https://www.google.com/flights/#search;f=JFK;t=${airportCode};d=${fmt(friday)};r=${fmt(sunday)};tt=r`;
}

export async function generateStaticParams() {
  return ALL_SPOTS.map(spot => ({ slug: spot.slug }));
}

export default async function SpotPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const spot = ALL_SPOTS.find(s => s.slug === slug);
  if (!spot) return <div>Spot not found</div>;

  let conditions = null;
  if (spot.type === 'surf') {
    conditions = await getSwellData(spot.lat, spot.lon);
  } else {
    const snow = await getSnowForecast(spot.lat, spot.lon);
    const totalSnowCm = snow.daily.snowfall_sum.reduce((a: number, b: number) => a + b, 0);
    conditions = {
      totalSnowCm: totalSnowCm.toFixed(1),
      totalSnowIn: (totalSnowCm / 2.54).toFixed(1),
    };
  }

  const tripCost = spot.flightPrice + (spot.hotelPrice * 5);
  const isSurf = spot.type === 'surf';

  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#0a0808', minHeight: '100vh', color: '#f0ebe0' }}>

      {/* NAV */}
      <nav style={{
        padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #1a1510'
      }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <img src="/logo.svg" alt="Strike Mission" style={{ height: '48px' }} />
        </a>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <a href="/" style={{ color: '#6b6560', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase' }}>Conditions</a>
          <a href="/about" style={{ color: '#6b6560', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase' }}>About</a>
          <a href="/strikes" style={{
            color: '#0a0808', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px',
            textTransform: 'uppercase', background: '#e8823a', padding: '10px 20px', borderRadius: '2px', fontWeight: 'bold'
          }}>Strike Missions</a>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position: 'relative', height: '50vh', overflow: 'hidden' }}>
        <img
          src={isSurf
            ? 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1800&q=80'
            : 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1800&q=80'}
          alt={spot.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35) contrast(1.15)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, #0a0808)' }} />
        <div style={{ position: 'absolute', bottom: '48px', left: '60px' }}>
          <a href="/strikes" style={{ color: '#e8823a', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            ← Back to Strike Missions
          </a>
          <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#6b6560', margin: '12px 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FlagIcon country={spot.country} size={16} /> {spot.location}
          </div>
          <h1 style={{ fontSize: '72px', fontWeight: 'bold', margin: '0 0 12px', letterSpacing: '-2px', lineHeight: 1 }}>
            {spot.name.toUpperCase()}
          </h1>
          <p style={{ color: '#b0a898', fontSize: '18px', margin: 0 }}>{spot.tagline}</p>
        </div>
      </div>

      <div style={{ padding: '60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '48px' }}>

          {/* LEFT COLUMN */}
          <div>

            {/* About */}
            <div style={{ marginBottom: '48px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '12px' }}>About</div>
              <p style={{ fontSize: '18px', lineHeight: 1.8, color: '#b0a898', margin: 0 }}>{spot.description}</p>
            </div>

            {/* Best break / run */}
            <div style={{ background: '#111010', borderTop: '2px solid #e8823a', padding: '24px', marginBottom: '48px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '12px' }}>
                {isSurf ? 'The Break' : 'The Mountain'}
              </div>
              <p style={{ fontSize: '16px', lineHeight: 1.7, color: '#f0ebe0', margin: '0 0 16px' }}>
                {isSurf ? spot.bestBreak : spot.bestRun}
              </p>
              <div style={{ fontSize: '13px', color: '#6b6560' }}>
                <span style={{ color: '#e8823a', marginRight: '8px' }}>Ideal conditions:</span>
                {spot.idealConditions}
              </div>
            </div>

            {/* Local Tips */}
            <div style={{ marginBottom: '48px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '20px' }}>Local Tips</div>
              {spot.localTips.map((tip, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '16px', padding: '16px 0',
                  borderBottom: '1px solid #1a1510'
                }}>
                  <div style={{ color: '#e8823a', fontWeight: 'bold', fontSize: '14px', minWidth: '24px' }}>{i + 1}</div>
                  <div style={{ fontSize: '15px', lineHeight: 1.6, color: '#b0a898' }}>{tip}</div>
                </div>
              ))}
            </div>

            {/* Weekend Trip */}
            <div style={{ marginBottom: '48px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '8px' }}>Weekend Strike</div>
              <h3 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 24px', letterSpacing: '-1px' }}>{spot.weekendTrip.title}</h3>
              {spot.weekendTrip.days.map((day, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '100px 1fr', gap: '24px',
                  padding: '20px 0', borderBottom: '1px solid #1a1510'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#e8823a', fontSize: '14px', letterSpacing: '1px' }}>{day.day}</div>
                  <div style={{ fontSize: '15px', lineHeight: 1.7, color: '#b0a898' }}>{day.plan}</div>
                </div>
              ))}
            </div>

            {/* Week Trip */}
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '8px' }}>Full Week Strike</div>
              <h3 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 24px', letterSpacing: '-1px' }}>{spot.weekTrip.title}</h3>
              {spot.weekTrip.days.map((day, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '100px 1fr', gap: '24px',
                  padding: '20px 0', borderBottom: '1px solid #1a1510'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#e8823a', fontSize: '14px', letterSpacing: '1px' }}>{day.day}</div>
                  <div style={{ fontSize: '15px', lineHeight: 1.7, color: '#b0a898' }}>{day.plan}</div>
                </div>
              ))}
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div>

            {/* Live Conditions */}
            {isSurf && conditions && 'waveHeight' in conditions && (
              <div style={{ background: '#111010', borderTop: '2px solid #e8823a', padding: '24px', marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '16px' }}>Live Conditions</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ background: '#0a0808', padding: '12px', textAlign: 'center' as const }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#e8823a' }}>
                      {conditions.waveHeightFt ?? 'N/A'}<span style={{ fontSize: '14px' }}>ft</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Wave Height</div>
                  </div>
                  <div style={{ background: '#0a0808', padding: '12px', textAlign: 'center' as const }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f0ebe0' }}>
                      {conditions.wavePeriod ?? 'N/A'}<span style={{ fontSize: '14px' }}>s</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Period</div>
                  </div>
                  <div style={{ background: '#0a0808', padding: '12px', textAlign: 'center' as const }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f0ebe0' }}>
                      {conditions.swellHeightFt ?? 'N/A'}<span style={{ fontSize: '14px' }}>ft</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Swell</div>
                  </div>
                  <div style={{ background: '#0a0808', padding: '12px', textAlign: 'center' as const }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f0ebe0' }}>
                      {conditions.windSpeed ?? 'N/A'}<span style={{ fontSize: '14px' }}>mph</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Wind</div>
                  </div>
                </div>

                {conditions.secondarySwellHeight && (
                  <div style={{ padding: '12px', background: '#0a0808', marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>Secondary Swell</div>
                    <div style={{ fontSize: '14px', color: '#f0ebe0' }}>
                      {conditions.secondarySwellHeight}ft @ {conditions.secondarySwellPeriod}s — {conditions.secondarySwellDirection}°
                    </div>
                  </div>
                )}

                {conditions.seaTemp && (
                  <div style={{ padding: '12px', background: '#0a0808', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>Sea Temp</div>
                    <div style={{ fontSize: '14px', color: '#f0ebe0' }}>
                      {(parseFloat(conditions.seaTemp) * 9/5 + 32).toFixed(0)}°F ({conditions.seaTemp}°C) — {parseFloat(conditions.seaTemp) < 15 ? '5/4mm wetsuit' : parseFloat(conditions.seaTemp) < 18 ? '3/2mm wetsuit' : parseFloat(conditions.seaTemp) < 22 ? 'Spring suit' : 'Boardshorts'}
                    </div>
                  </div>
                )}

                <div style={{ borderTop: '1px solid #1a1510', paddingTop: '16px' }}>
                  <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '12px' }}>3 Day Forecast</div>
                  {(conditions.forecast7DayFt ?? []).slice(0, 3).map((height: string, i: number) => {
                    const days = ['Today', 'Tomorrow', 'Day 3'];
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1a1510' }}>
                        <div style={{ fontSize: '13px', color: '#6b6560' }}>{days[i]}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f0ebe0' }}>{height}ft</div>
                          {conditions.forecast7DayPeriod?.[i] && (
                            <div style={{ fontSize: '12px', color: '#4a4540' }}>{conditions.forecast7DayPeriod[i].toFixed(0)}s</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ marginTop: '12px', padding: '10px', background: '#1a1510', textAlign: 'center' as const }}>
                    <div style={{ fontSize: '11px', color: '#e8823a', letterSpacing: '2px', textTransform: 'uppercase' }}>Premium — 16 day forecast</div>
                    <div style={{ fontSize: '12px', color: '#4a4540', marginTop: '4px' }}>Coming soon</div>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#4a4540', marginTop: '12px', textAlign: 'center' as const }}>Updated every 30 mins</div>
              </div>
            )}

            {/* Snow Conditions */}
            {!isSurf && conditions && 'totalSnowIn' in conditions && (
              <div style={{ background: '#111010', borderTop: '2px solid #e8823a', padding: '24px', marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '16px' }}>Snow Forecast</div>
                <div style={{ background: '#0a0808', padding: '16px', textAlign: 'center' as const }}>
                  <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#e8823a' }}>
                    {conditions.totalSnowIn}<span style={{ fontSize: '18px' }}>"</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#4a4540', marginTop: '4px' }}>{conditions.totalSnowCm}cm</div>
                  <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '6px' }}>7 Day Snowfall</div>
                </div>
                <div style={{ fontSize: '11px', color: '#4a4540', marginTop: '12px', textAlign: 'center' as const }}>Updated hourly</div>
              </div>
            )}

            {/* Best Months */}
            <div style={{ background: '#111010', padding: '24px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '16px' }}>Best Months</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px' }}>
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((month, i) => (
                  <div key={month} style={{
                    padding: '6px 12px', fontSize: '12px', letterSpacing: '1px',
                    background: spot.bestMonths.includes(i + 1) ? '#e8823a' : '#1a1510',
                    color: spot.bestMonths.includes(i + 1) ? '#0a0808' : '#4a4540',
                    fontWeight: spot.bestMonths.includes(i + 1) ? 'bold' : 'normal',
                  }}>
                    {month}
                  </div>
                ))}
              </div>
            </div>

            {/* Trip Cost */}
            <div style={{ background: '#111010', padding: '24px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '16px' }}>Trip Cost Estimate</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #1a1510' }}>
                <span style={{ fontSize: '14px', color: '#6b6560' }}>Return flights from {spot.flightFrom}</span>
                <span style={{ fontWeight: 'bold' }}>~${spot.flightPrice}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #1a1510' }}>
                <span style={{ fontSize: '14px', color: '#6b6560' }}>Accommodation/night</span>
                <span style={{ fontWeight: 'bold' }}>~${spot.hotelPrice}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0' }}>
                <span style={{ fontSize: '14px', color: '#6b6560' }}>5 day trip total est.</span>
                <span style={{ fontWeight: 'bold', color: '#e8823a', fontSize: '22px' }}>~${tripCost}</span>
              </div>
            </div>

            {/* Book Button */}
            <a href={getGoogleFlightsUrl(spot.airportCode)} target="_blank" rel="noopener noreferrer" style={{
              display: 'block', width: '100%', padding: '18px',
              background: '#e8823a', color: '#0a0808',
              fontSize: '13px', fontWeight: 'bold', letterSpacing: '2px',
              textTransform: 'uppercase', textDecoration: 'none',
              textAlign: 'center' as const, boxSizing: 'border-box' as const
            }}>
              Book This Strike →
            </a>

          </div>
        </div>
      </div>
    </main>
  );
}