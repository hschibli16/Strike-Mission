import { getSpotBySlug, getSpotsFromDB } from '../../lib/getSpots';
import { getSwellData } from '../../stormglass';
import { getSnowForecast } from '../../weather';
import { getSkiResortData } from '../../skiresort';
import { scoreSurfSpot, scoreSkiSpot, getStrikeLabel, getSkiLabel } from '../../scoring';
import MobileNav from '../../components/MobileNav';

export async function generateStaticParams() {
  const spots = await getSpotsFromDB();
  return spots.map(s => ({ slug: s.slug }));
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function DirectionArrow({ degrees }: { degrees: number }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: `rotate(${degrees}deg)`, display: 'inline-block' }}>
      <path d="M12 2L12 22M12 2L6 8M12 2L18 8" stroke="#f0ebe0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function QualityBar({ score }: { score: number }) {
  const segments = 10;
  const filled = Math.round((score / 100) * segments);
  const color = score >= 72 ? '#4ade80' : score >= 52 ? '#86efac' : score >= 32 ? '#fbbf24' : '#4a4540';
  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {Array.from({ length: segments }).map((_, i) => (
        <div key={i} style={{
          width: '18px', height: '4px',
          background: i < filled ? color : '#1a1510',
          transition: 'background 0.2s',
        }} />
      ))}
      <span style={{ fontSize: '12px', color: '#4a4540', marginLeft: '8px' }}>{score}/100</span>
    </div>
  );
}

export default async function SpotPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const spot = await getSpotBySlug(slug);

  if (!spot) {
    return (
      <main style={{ fontFamily: "'Georgia', serif", background: '#0a0808', minHeight: '100vh', color: '#f0ebe0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌊</div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '12px' }}>Spot not found</h1>
          <a href="/guide" style={{ color: '#f0ebe0', textDecoration: 'none', borderBottom: '1px solid #2a2520' }}>← Back to Guide</a>
        </div>
      </main>
    );
  }

  const isSurf = spot.type === 'surf';

  let conditions: any = null;
  let score = 0;
  let strike: any = null;

  if (isSurf) {
    const swell = await getSwellData(spot.lat, spot.lon);
    score = scoreSurfSpot({
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
    strike = getStrikeLabel(score);
    conditions = swell;
  } else {
    const [snow, skiResort] = await Promise.all([
      getSnowForecast(spot.lat, spot.lon),
      getSkiResortData(spot.location),
    ]);
    const totalSnowCm = snow.consensus
      ? parseFloat(snow.consensus.totalSnowCm)
      : snow.daily.snowfall_sum.reduce((a: number, b: number) => a + b, 0);
    score = scoreSkiSpot({
      totalSnowCm,
      bestMonths: spot.bestMonths,
      flightPrice: spot.flightPrice,
    });
    strike = getSkiLabel(score);
    conditions = {
      totalSnowCm: totalSnowCm.toFixed(1),
      totalSnowIn: (totalSnowCm / 2.54).toFixed(1),
      skiResort,
      forecast7Day: snow.daily,
      consensus: snow.consensus,
    };
  }

  const currentMonth = new Date().getMonth() + 1;
  const isInSeason = spot.bestMonths.includes(currentMonth);
  const tripCost5Day = spot.flightPrice + (spot.hotelPrice * 5);
  const tripCost7Day = spot.flightPrice + (spot.hotelPrice * 7);

  function getGoogleFlightsUrl() {
    const today = new Date();
    const friday = new Date(today);
    friday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));
    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 9);
    const fmt = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '');
    return `https://www.google.com/flights/#search;f=JFK;t=${spot!.airportCode};d=${fmt(friday)};r=${fmt(sunday)};tt=r`;
  }

  const heroImage = isSurf
    ? 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1800&q=80'
    : 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1800&q=80';

  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#0a0808', minHeight: '100vh', color: '#f0ebe0' }}>
      <style>{`
        .spot-page-grid { display: grid; grid-template-columns: 1fr 380px; gap: 0; }
        .spot-sidebar { position: sticky; top: 61px; height: calc(100vh - 61px); overflow-y: auto; }
        .itinerary-tabs { display: flex; gap: 2px; margin-bottom: 24px; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .day-row { display: grid; grid-template-columns: 90px 1fr; gap: 20px; padding: 20px 0; border-bottom: 1px solid #1a1510; }
        @media (max-width: 768px) {
          .spot-page-grid { grid-template-columns: 1fr !important; }
          .spot-sidebar { position: static !important; height: auto !important; }
          .day-row { grid-template-columns: 70px 1fr !important; gap: 12px !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #1a1510', position: 'sticky', top: 0,
        background: 'rgba(10,8,8,0.97)', zIndex: 100,
      }}>
        <a href="/" style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase', color: '#f0ebe0', textDecoration: 'none' }}>
          Strike Mission
        </a>
        <MobileNav />
      </nav>

      {/* HERO */}
      <div style={{ position: 'relative', height: '85vh', overflow: 'hidden' }}>
        <img
          src={heroImage}
          alt={spot.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35) contrast(1.15)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,8,8,0.2) 0%, transparent 30%, transparent 50%, #0a0808 100%)' }} />

        {/* Back link */}
        <div style={{ position: 'absolute', top: '32px', left: '60px' }}>
          <a href="/guide" style={{ color: '#f0ebe0', textDecoration: 'none', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.6 }}>
            ← Guide
          </a>
        </div>

        {/* Hero content */}
        <div style={{ position: 'absolute', bottom: '60px', left: '60px', right: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{
              background: strike.bg, color: strike.color,
              fontSize: '11px', letterSpacing: '3px', padding: '6px 16px', fontWeight: 'bold',
            }}>
              {strike.label}
            </div>
            {isInSeason && (
              <div style={{ fontSize: '11px', color: '#4ade80', letterSpacing: '2px' }}>
                IN SEASON
              </div>
            )}
            <div style={{ fontSize: '11px', color: '#4a4540', letterSpacing: '2px' }}>
              {spot.flag} {spot.country}
            </div>
          </div>

          <h1 style={{ fontSize: '80px', fontWeight: 'bold', margin: '0 0 16px', letterSpacing: '-3px', lineHeight: 1, color: '#f0ebe0' }}>
            {spot.name}
          </h1>

          <div style={{ fontSize: '20px', color: '#b0a898', maxWidth: '600px', lineHeight: 1.5, marginBottom: '24px' }}>
            {spot.tagline}
          </div>

          <QualityBar score={score} />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="spot-page-grid">

        {/* LEFT — Content */}
        <div style={{ borderRight: '1px solid #1a1510' }}>

          {/* ABOUT */}
          <div style={{ padding: '60px', borderBottom: '1px solid #1a1510' }}>
            <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.4, marginBottom: '20px' }}>
              About
            </div>
            <p style={{ fontSize: '20px', lineHeight: 1.8, color: '#b0a898', margin: 0, maxWidth: '680px' }}>
              {spot.description}
            </p>
          </div>

          {/* THE BREAK / MOUNTAIN */}
          {(spot.bestBreak || spot.bestRun) && (
            <div style={{ padding: '60px', borderBottom: '1px solid #1a1510' }}>
              <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.4, marginBottom: '20px' }}>
                {isSurf ? 'The Break' : 'The Mountain'}
              </div>
              <p style={{ fontSize: '17px', lineHeight: 1.8, color: '#b0a898', margin: '0 0 24px', maxWidth: '680px' }}>
                {isSurf ? spot.bestBreak : spot.bestRun}
              </p>
              {spot.idealConditions && (
                <div style={{ background: '#111010', borderLeft: '3px solid #f0ebe0', padding: '16px 20px' }}>
                  <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#4a4540', marginBottom: '6px' }}>Ideal Conditions</div>
                  <div style={{ fontSize: '15px', color: '#b0a898' }}>{spot.idealConditions}</div>
                </div>
              )}
            </div>
          )}

          {/* BEST MONTHS */}
          <div style={{ padding: '60px', borderBottom: '1px solid #1a1510' }}>
            <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.4, marginBottom: '24px' }}>
              Best Months
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {MONTH_NAMES.map((month, i) => {
                const monthNum = i + 1;
                const isBest = spot.bestMonths.includes(monthNum);
                const isCurrent = monthNum === currentMonth;
                return (
                  <div key={month} style={{
                    padding: '8px 14px', fontSize: '13px', letterSpacing: '1px',
                    background: isBest ? '#f0ebe0' : '#111010',
                    color: isBest ? '#0a0808' : '#2a2520',
                    fontWeight: isBest ? 'bold' : 'normal',
                    border: isCurrent ? '1px solid #f0ebe0' : '1px solid transparent',
                    position: 'relative',
                  }}>
                    {month}
                    {isCurrent && (
                      <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }} />
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#4a4540' }}>
              Green dot = current month
            </div>
          </div>

          {/* ITINERARIES */}
          <div style={{ padding: '60px', borderBottom: '1px solid #1a1510' }}>
            <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.4, marginBottom: '24px' }}>
              Trip Planner
            </div>

            {spot.weekendTrip && (
              <div style={{ marginBottom: '48px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '-1px' }}>
                  {spot.weekendTrip.title}
                </div>
                <div style={{ fontSize: '13px', color: '#4a4540', marginBottom: '24px' }}>Weekend · 3 days</div>
                {spot.weekendTrip.days.map((day: any, i: number) => (
                  <div key={i} className="day-row">
                    <div style={{ fontSize: '12px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', paddingTop: '2px' }}>
                      {day.day}
                    </div>
                    <div style={{ fontSize: '15px', color: '#b0a898', lineHeight: 1.7 }}>
                      {day.plan}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {spot.weekTrip && (
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '-1px' }}>
                  {spot.weekTrip.title}
                </div>
                <div style={{ fontSize: '13px', color: '#4a4540', marginBottom: '24px' }}>Full week · 7 days</div>
                {spot.weekTrip.days.map((day: any, i: number) => (
                  <div key={i} className="day-row">
                    <div style={{ fontSize: '12px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', paddingTop: '2px' }}>
                      {day.day}
                    </div>
                    <div style={{ fontSize: '15px', color: '#b0a898', lineHeight: 1.7 }}>
                      {day.plan}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LOCAL TIPS */}
          {spot.localTips && spot.localTips.length > 0 && (
            <div style={{ padding: '60px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.4, marginBottom: '24px' }}>
                Local Knowledge
              </div>
              {spot.localTips.map((tip: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: '20px', padding: '16px 0', borderBottom: '1px solid #1a1510' }}>
                  <div style={{ fontSize: '11px', color: '#2a2520', letterSpacing: '1px', paddingTop: '3px', flexShrink: 0 }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: '15px', color: '#b0a898', lineHeight: 1.7 }}>{tip}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Sticky Sidebar */}
        <div className="spot-sidebar" style={{ background: '#0d0b0b' }}>

          {/* CONDITIONS */}
          <div style={{ padding: '32px', borderBottom: '1px solid #1a1510' }}>
            <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#4a4540', marginBottom: '16px' }}>
              Live Conditions
            </div>

            {isSurf && conditions && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ background: '#111010', padding: '16px', textAlign: 'center' as const, gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#f0ebe0', lineHeight: 1 }}>
                      {conditions.waveHeightFt ?? 'N/A'}<span style={{ fontSize: '20px' }}>ft</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#4a4540', marginTop: '4px' }}>{conditions.waveHeight ?? '—'}m</div>
                    <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '6px' }}>Wave Height</div>
                  </div>
                  <div style={{ background: '#111010', padding: '14px', textAlign: 'center' as const }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f0ebe0' }}>
                      {conditions.wavePeriod ?? 'N/A'}<span style={{ fontSize: '13px' }}>s</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Period</div>
                  </div>
                  <div style={{ background: '#111010', padding: '14px', textAlign: 'center' as const }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f0ebe0' }}>
                      {conditions.windSpeed ?? 'N/A'}<span style={{ fontSize: '13px' }}>mph</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Wind</div>
                  </div>
                </div>

                {conditions.swellHeightFt && (
                  <div style={{ background: '#111010', padding: '14px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>Primary Swell</div>
                    <div style={{ fontSize: '15px', color: '#f0ebe0' }}>
                      {conditions.swellHeightFt}ft @ {conditions.swellPeriod ?? '—'}s
                      {conditions.swellDirection && (
                        <span style={{ color: '#4a4540', marginLeft: '8px' }}>
                          <DirectionArrow degrees={parseFloat(conditions.swellDirection)} /> {conditions.swellDirection}°
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {conditions.secondarySwellHeight && (
                  <div style={{ background: '#111010', padding: '14px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>Secondary Swell</div>
                    <div style={{ fontSize: '15px', color: '#f0ebe0' }}>
                      {conditions.secondarySwellHeight}m @ {conditions.secondarySwellPeriod ?? '—'}s
                    </div>
                  </div>
                )}

                {conditions.seaTemp && (
                  <div style={{ background: '#111010', padding: '14px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>Sea Temp</div>
                    <div style={{ fontSize: '15px', color: '#f0ebe0' }}>
                      {(parseFloat(conditions.seaTemp) * 9/5 + 32).toFixed(0)}°F ({conditions.seaTemp}°C)
                    </div>
                    <div style={{ fontSize: '12px', color: '#4a4540', marginTop: '4px' }}>
                      {parseFloat(conditions.seaTemp) < 15 ? '5/4mm + boots + gloves + hood' :
                       parseFloat(conditions.seaTemp) < 18 ? '4/3mm wetsuit' :
                       parseFloat(conditions.seaTemp) < 22 ? '3/2mm spring suit' : 'Boardshorts'}
                    </div>
                  </div>
                )}

                {conditions.forecast7DayFt && conditions.forecast7DayFt.length > 0 && (
                  <div>
                    <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>3 Day Forecast</div>
                    {conditions.forecast7DayFt.slice(0, 3).map((height: string, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1a1510' }}>
                        <div style={{ fontSize: '13px', color: '#4a4540' }}>{['Today', 'Tomorrow', 'Day 3'][i]}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {conditions.forecast7DayPeriod?.[i] && (
                            <div style={{ fontSize: '12px', color: '#4a4540' }}>{Number(conditions.forecast7DayPeriod[i]).toFixed(0)}s</div>
                          )}
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f0ebe0' }}>{height}ft</div>
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: '12px', padding: '10px', background: '#111010', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '10px', color: '#f0ebe0', letterSpacing: '2px', textTransform: 'uppercase' }}>Premium — 16 day forecast</div>
                      <div style={{ fontSize: '11px', color: '#4a4540', marginTop: '4px' }}>Coming soon</div>
                    </div>
                  </div>
                )}

                {conditions.confidenceScore && (
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#4a4540' }}>Updated every 30 mins</div>
                    <div style={{
                      fontSize: '11px', padding: '3px 8px',
                      background: conditions.confidenceScore >= 80 ? '#4ade8022' : '#fbbf2422',
                      color: conditions.confidenceScore >= 80 ? '#4ade80' : '#fbbf24',
                      border: `1px solid ${conditions.confidenceScore >= 80 ? '#4ade80' : '#fbbf24'}`,
                    }}>
                      {conditions.confidenceScore}% confidence
                    </div>
                  </div>
                )}
              </>
            )}

            {!isSurf && conditions && (
              <>
                <div style={{ background: '#111010', padding: '20px', textAlign: 'center' as const, marginBottom: '8px' }}>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#f0ebe0', lineHeight: 1 }}>
                    {conditions.totalSnowIn}<span style={{ fontSize: '20px' }}>"</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#4a4540', marginTop: '4px' }}>{conditions.totalSnowCm}cm</div>
                  <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '6px' }}>7 Day Forecast Snowfall</div>
                </div>

                {conditions.skiResort && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ background: '#111010', padding: '14px', textAlign: 'center' as const }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f0ebe0' }}>
                          {conditions.skiResort.minTempF}°F
                        </div>
                        <div style={{ fontSize: '11px', color: '#4a4540', marginTop: '2px' }}>{conditions.skiResort.minTempC}°C</div>
                        <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Low Temp</div>
                      </div>
                      <div style={{ background: '#111010', padding: '14px', textAlign: 'center' as const }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f0ebe0' }}>
                          {conditions.skiResort.chanceOfSnow}%
                        </div>
                        <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Snow Chance</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                      <div style={{ background: '#111010', padding: '14px', textAlign: 'center' as const }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f0ebe0' }}>
                          {conditions.skiResort.snowDepth ? (parseFloat(conditions.skiResort.snowDepth) / 2.54).toFixed(0) : '—'}"
                        </div>
                        <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Snow Depth</div>
                      </div>
                      <div style={{ background: '#111010', padding: '14px', textAlign: 'center' as const }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f0ebe0' }}>
                          {conditions.skiResort.windSpeedMph ?? '—'}<span style={{ fontSize: '12px' }}>mph</span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Wind</div>
                      </div>
                    </div>

                    {conditions.skiResort.forecast && conditions.skiResort.forecast.length > 0 && (
                      <div>
                        <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>3 Day Forecast</div>
                        {conditions.skiResort.forecast.slice(0, 3).map((day: any, i: number) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1a1510' }}>
                            <div style={{ fontSize: '13px', color: '#4a4540' }}>{['Today', 'Tomorrow', 'Day 3'][i]}</div>
                            <div style={{ fontSize: '12px', color: '#6b6560', maxWidth: '100px', textAlign: 'right' as const }}>{day.desc}</div>
                            <div style={{ fontSize: '14px', color: '#f0ebe0', fontWeight: 'bold' }}>
                              {(parseFloat(day.snowfall) / 2.54).toFixed(1)}"
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                <div style={{ fontSize: '11px', color: '#4a4540', marginTop: '12px', textAlign: 'center' as const }}>
                  Open-Meteo + WorldWeatherOnline
                </div>
              </>
            )}
          </div>

          {/* TRIP COST */}
          <div style={{ padding: '32px', borderBottom: '1px solid #1a1510' }}>
            <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#4a4540', marginBottom: '16px' }}>
              Trip Cost Estimate
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '14px', color: '#4a4540' }}>Flights from NYC</span>
              <span style={{ fontSize: '14px', color: '#f0ebe0', fontWeight: 'bold' }}>~${spot.flightPrice}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '14px', color: '#4a4540' }}>Hotel per night</span>
              <span style={{ fontSize: '14px', color: '#f0ebe0', fontWeight: 'bold' }}>~${spot.hotelPrice}</span>
            </div>
            <div style={{ borderTop: '1px solid #1a1510', paddingTop: '12px', marginBottom: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#4a4540' }}>Weekend est.</span>
                <span style={{ fontSize: '13px', color: '#f0ebe0' }}>~${spot.flightPrice + spot.hotelPrice * 3}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#4a4540' }}>5 day est.</span>
                <span style={{ fontSize: '15px', color: '#f0ebe0', fontWeight: 'bold' }}>~${tripCost5Day}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#4a4540' }}>Week est.</span>
                <span style={{ fontSize: '13px', color: '#f0ebe0' }}>~${tripCost7Day}</span>
              </div>
            </div>
          </div>

          {/* BOOK CTA */}
          <div style={{ padding: '32px' }}>
            <a href={getGoogleFlightsUrl()} target="_blank" rel="noopener noreferrer" style={{
              display: 'block', padding: '18px', background: '#f0ebe0',
              color: '#0a0808', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold',
              letterSpacing: '3px', textTransform: 'uppercase', textAlign: 'center' as const,
              marginBottom: '12px',
            }}>
              Search Flights →
            </a>
            <a href={`/guide`} style={{
              display: 'block', padding: '14px', background: 'transparent',
              border: '1px solid #2a2520', color: '#4a4540',
              textDecoration: 'none', fontSize: '11px', fontWeight: 'bold',
              letterSpacing: '2px', textTransform: 'uppercase', textAlign: 'center' as const,
            }}>
              ← Back to All Destinations
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}
