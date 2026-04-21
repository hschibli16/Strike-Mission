import { getSpotBySlug, getSpotsFromDB, getRegionBySlug } from '../../lib/getSpots';
import { getStrikeLabel, getSkiLabel } from '../../scoring';
import { getSurfConditions } from '../../lib/conditions/surf-conditions';
import { getSkiConditions } from '../../lib/conditions/ski-conditions';
import MobileNav from '../../components/MobileNav';
import StrikeVerdictHero, { type BestWindow } from '../../components/StrikeVerdictHero';
import { fetchBuoyData, formatBuoyAge } from '../../lib/buoy';
import { transformBuoyToSurf } from '../../lib/surf-transform';
import { getSpotConfidence } from '../../lib/spot-confidence';
import NotifyWhenLiveForm from '../../components/NotifyWhenLiveForm';
import { fetchTideData, describeTideState, formatTideTime, getTideState, tideStateLabel } from '../../lib/tide';
import type { TideObservation } from '../../lib/tide';
import TideSparkline from '../../components/TideSparkline';

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
    conditions = await getSurfConditions({
      lat: spot.lat,
      lon: spot.lon,
      idealSwellDirection: spot.idealSwellDirection,
      idealWindDirection: spot.idealWindDirection,
      bestMonths: spot.bestMonths,
      flightPrice: spot.flightPrice,
    });
    score = conditions.overallScore;
    strike = getStrikeLabel(score);
  } else {
    conditions = await getSkiConditions({
      lat: spot.lat,
      lon: spot.lon,
      location: spot.location,
      skiResortQuery: spot.skiResortQuery,
      bestMonths: spot.bestMonths,
      flightPrice: spot.flightPrice,
    });
    score = conditions.overallScore;
    strike = getSkiLabel(score);
  }

  const buoyData = (isSurf && spot.buoyId) ? await fetchBuoyData(spot.buoyId) : null;
  const showBuoy = buoyData !== null && buoyData.waveHeightFt !== null;

  const surfEstimate = (
    isSurf &&
    buoyData &&
    typeof spot.refractionCoefficient === 'number' &&
    typeof spot.minUsefulPeriod === 'number'
  )
    ? transformBuoyToSurf({
        buoy: buoyData,
        refractionCoefficient: spot.refractionCoefficient,
        minUsefulPeriod: spot.minUsefulPeriod,
      })
    : null;

  const spotConfidence = getSpotConfidence(spot);
  const isLowConfidence = isSurf && spotConfidence.tier === 'low';
  const isMediumConfidence = isSurf && spotConfidence.tier === 'medium';

  const tideData: TideObservation | null = (isSurf && spot.tideStationId)
    ? await fetchTideData(spot.tideStationId)
    : null;

  const region = spot.regionSlug ? await getRegionBySlug(spot.regionSlug) : null;
  const backHref = region ? `/region/${region.slug}` : '/';
  const backLabel = region ? `← ${region.name}` : '← All spots';

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

  const verdictLabel = strike.label;
  const isBookable = verdictLabel !== 'BLOWN OUT' && verdictLabel !== 'FLAT' && verdictLabel !== 'ICY' && verdictLabel !== 'BARE';

  let bestWindow: BestWindow | null = null;
  if (conditions.outlook && conditions.outlook.length > 0) {
    const best = conditions.outlook.reduce((a: any, b: any) =>
      parseFloat(b.waveHeightFt ?? b.snowIn ?? '0') > parseFloat(a.waveHeightFt ?? a.snowIn ?? '0') ? b : a
    );
    let dayOffset = 0;
    let dayIndex = 1;
    const lbl: string = best.dayLabel ?? '';
    if (lbl === 'Today') { dayOffset = 0; dayIndex = 1; }
    else if (lbl === 'Tomorrow') { dayOffset = 1; dayIndex = 2; }
    else {
      const m = lbl.match(/(\d+)/);
      if (m) { dayIndex = parseInt(m[1], 10); dayOffset = dayIndex - 1; }
    }
    let dateStr: string;
    if (best.date) {
      const parsed = new Date(best.date);
      dateStr = isNaN(parsed.getTime())
        ? (() => { const d = new Date(); d.setDate(d.getDate() + dayOffset); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); })()
        : parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      const d = new Date();
      d.setDate(d.getDate() + dayOffset);
      dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    bestWindow = {
      dayIndex,
      label: best.dayLabel,
      date: dateStr,
      height: best.waveHeightFt ? `${best.waveHeightFt}ft` : best.snowIn ? `${best.snowIn}"` : '—',
      period: best.periodSeconds ? ` @ ${best.periodSeconds}s` : best.tempHighF ? ` · ${best.tempHighF}°F` : '',
      condLabel: best.label ?? verdictLabel,
    };
  }

  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#0a0808', minHeight: '100vh', color: '#f0ebe0' }}>
      <style>{`
        .spot-content-grid { display: grid; grid-template-columns: 1fr 380px; gap: 0; align-items: start; overflow-x: hidden; }
        .spot-sidebar { position: sticky; top: 61px; align-self: start; }
        .itinerary-tabs { display: flex; gap: 2px; margin-bottom: 24px; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .day-row { display: grid; grid-template-columns: 90px 1fr; gap: 20px; padding: 20px 0; border-bottom: 1px solid #1a1510; }
        .spot-hero-image { height: 320px; }
        @media (max-width: 768px) {
          .spot-content-grid { grid-template-columns: 1fr !important; }
          .spot-sidebar { position: static !important; }
          .day-row { grid-template-columns: 70px 1fr !important; gap: 12px !important; }
          .spot-hero-image { height: 200px !important; }
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
      <div className="spot-hero-image" style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src={heroImage}
          alt={spot.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35) contrast(1.15)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,8,8,0.2) 0%, transparent 60%, #0a0808 100%)' }} />

        {/* Back link */}
        <div style={{ position: 'absolute', top: '20px', left: '40px' }}>
          <a href={backHref} style={{ color: '#f0ebe0', textDecoration: 'none', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.6 }}>
            {backLabel}
          </a>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="spot-content-grid">

        {/* LEFT COLUMN */}
        <div style={{ borderRight: '1px solid #1a1510', overflowX: 'hidden', minWidth: 0 }}>

          {/* VERDICT INTRO */}
          <div style={{ borderBottom: '1px solid #1a1510' }}>
            {isLowConfidence ? (
              <div style={{ padding: '48px 60px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '8px' }}>{spot.flag} {spot.location}</div>
                <h1 style={{ fontSize: '48px', fontFamily: "'Georgia', serif", fontWeight: 'bold', color: '#f0ebe0', margin: '0 0 16px 0', lineHeight: 1.1 }}>{spot.name}</h1>
                <p style={{ fontSize: '18px', color: '#6b6560', margin: '0 0 40px 0', fontStyle: 'italic' }}>{spot.tagline}</p>
                <div style={{ border: '1px solid #1a1510', padding: '48px', background: '#0a0808', maxWidth: '600px' }}>
                  <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '20px' }}>Forecast Unavailable</div>
                  <h2 style={{ fontSize: '32px', fontFamily: "'Georgia', serif", color: '#f0ebe0', margin: '0 0 20px 0', fontWeight: 'normal' }}>We&apos;re building out this spot</h2>
                  <p style={{ fontSize: '16px', color: '#f0ebe0', lineHeight: 1.6, maxWidth: '520px', margin: '0 0 32px 0' }}>
                    Strike Mission doesn&apos;t have a reliable data source for {spot.name} yet. We&apos;re working to partner with local observers and expand our buoy coverage. Drop your email below and we&apos;ll let you know the moment this spot goes live with accurate forecasts.
                  </p>
                  <NotifyWhenLiveForm spotName={spot.name} />
                </div>
              </div>
            ) : (
              <StrikeVerdictHero
                spotName={spot.name}
                location={spot.location}
                flag={spot.flag}
                tagline={spot.tagline}
                verdict={verdictLabel}
                summary={conditions.verdict}
                isBookable={isBookable}
              />
            )}
          </div>

          {/* LIVE CONDITIONS — hidden for LOW tier */}
          {!isLowConfidence && <div style={{ padding: '40px 60px', borderBottom: '1px solid #1a1510' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', margin: '0 0 12px 0' }}>
              Live Conditions
            </div>
            <div style={{ maxWidth: '760px' }}>
          {isSurf && conditions && (
            <>
              {/* Verdict */}
              <div style={{ background: '#111010', borderLeft: '3px solid #f0ebe0', padding: '16px 20px', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', margin: '0 0 8px 0' }}>Conditions Summary</div>
                <div style={{ fontSize: '14px', color: '#b0a898', lineHeight: 1.7 }}>{conditions.verdict}</div>
              </div>

              {/* WHY THIS VERDICT */}
              {isMediumConfidence && (
                <div style={{ border: '1px solid #fbbf24', padding: '16px 24px', background: '#0a0808', margin: '24px 0', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fbbf24', flexShrink: 0, marginTop: '6px' }} />
                  <div style={{ fontSize: '14px', fontFamily: "'Georgia', serif", color: '#f0ebe0', lineHeight: 1.6 }}>
                    Forecast approximated. This spot&apos;s complex coastal geometry makes precise nowcasts harder. We&apos;re working on better data sources.
                  </div>
                </div>
              )}
              {(() => {
                type VerdictRow = { factor: string; dot: string; text: string };
                const rows: VerdictRow[] = [];

                // 1. Swell Direction
                if (conditions.primarySwell?.directionDegrees != null && spot.idealSwellDirection != null) {
                  const actual = conditions.primarySwell.directionDegrees;
                  const ideal = spot.idealSwellDirection;
                  let diff = Math.abs(actual - ideal);
                  if (diff > 180) diff = 360 - diff;
                  if (diff <= 30) {
                    rows.push({ factor: 'Swell Direction', dot: '#4ade80', text: `Primary swell is ${actual}° — matches the ideal ${ideal}° window for this spot` });
                  } else if (diff <= 60) {
                    rows.push({ factor: 'Swell Direction', dot: '#fbbf24', text: `Primary swell is ${actual}° — close to but not perfectly aligned with ideal ${ideal}°. Spot will work but not at its best.` });
                  } else {
                    rows.push({ factor: 'Swell Direction', dot: '#ef4444', text: `Primary swell is ${actual}° — wrong angle. This spot needs ${ideal}° swells to break properly.` });
                  }
                }

                // 2. Swell Period
                const period = conditions.wavePeriod ? parseFloat(conditions.wavePeriod) : null;
                if (period != null && !isNaN(period)) {
                  if (period < 8) {
                    rows.push({ factor: 'Swell Period', dot: '#ef4444', text: `${period}s — this is wind chop, not groundswell. Waves will be weak and disorganized.` });
                  } else if (period < 10) {
                    rows.push({ factor: 'Swell Period', dot: '#fbbf24', text: `${period}s — short-period swell. Waves will have less power than a true groundswell.` });
                  } else if (period < 13) {
                    rows.push({ factor: 'Swell Period', dot: '#4ade80', text: `${period}s — solid groundswell. Waves will have real energy and organization.` });
                  } else {
                    rows.push({ factor: 'Swell Period', dot: '#4ade80', text: `${period}s — strong, long-period groundswell. Maximum wave power and quality.` });
                  }
                }

                // 3. Wind
                if (conditions.windSpeedMph != null) {
                  const speed = parseFloat(conditions.windSpeedMph);
                  const dirScore = conditions.windDirectionScore ?? 50;
                  const label = conditions.windDirectionLabel ?? '';
                  const isOffshore = dirScore >= 70;
                  const isCross = dirScore >= 40 && dirScore < 70;
                  if (isOffshore) {
                    if (speed < 15) rows.push({ factor: 'Wind', dot: '#4ade80', text: `${speed}mph offshore — clean, grooming the wave face` });
                    else if (speed <= 25) rows.push({ factor: 'Wind', dot: '#fbbf24', text: `${speed}mph offshore — strong offshore, may cause waves to stand up late` });
                    else rows.push({ factor: 'Wind', dot: '#ef4444', text: `${speed}mph offshore — too strong, will hold waves up and make drops difficult` });
                  } else if (isCross) {
                    rows.push({ factor: 'Wind', dot: '#fbbf24', text: `${speed}mph cross-shore — not ideal but surfable if wind is light` });
                  } else {
                    if (speed < 10) rows.push({ factor: 'Wind', dot: '#fbbf24', text: `${speed}mph onshore — light but will soften wave shape` });
                    else rows.push({ factor: 'Wind', dot: '#ef4444', text: `${speed}mph onshore — will chop up the surface and ruin wave shape` });
                  }
                }

                // 4. Tide
                if (tideData) {
                  const state = describeTideState(tideData);
                  const nearHigh = tideData.nextHigh && Math.abs(tideData.nextHigh.minutesFromNow) <= 30;
                  const nearLow = tideData.nextLow && Math.abs(tideData.nextLow.minutesFromNow) <= 30;
                  const isMidTide = !nearHigh && !nearLow && tideData.trend !== 'unknown';
                  let tideDot = '#fbbf24';
                  let tideText = state;
                  if (nearHigh) {
                    tideDot = '#fbbf24';
                    tideText = `${state} — some spots get mushy at peak high`;
                  } else if (nearLow) {
                    tideDot = '#4ade80';
                    tideText = `${state} — often the best tide for reef/point breaks`;
                  } else if (isMidTide) {
                    tideDot = '#4ade80';
                    tideText = `${state} — workable tide window`;
                  }
                  rows.push({ factor: 'Tide', dot: tideDot, text: tideText });
                }

                // 5. Season
                const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                const cm = currentMonth;
                const prevM = cm === 1 ? 12 : cm - 1;
                const nextM = cm === 12 ? 1 : cm + 1;
                const monthName = monthNames[cm - 1];
                if (spot.bestMonths.includes(cm)) {
                  rows.push({ factor: 'Season', dot: '#4ade80', text: `${monthName} is peak season for this spot` });
                } else if (spot.bestMonths.includes(prevM) || spot.bestMonths.includes(nextM)) {
                  rows.push({ factor: 'Season', dot: '#fbbf24', text: `${monthName} is shoulder season — spot can still work but swells are less consistent` });
                } else {
                  rows.push({ factor: 'Season', dot: '#ef4444', text: `${monthName} is off-season — rare for this spot to get quality waves` });
                }

                // 6. Data Confidence
                if (surfEstimate) {
                  if (surfEstimate.confidence === 'high') {
                    rows.push({ factor: 'Data Confidence', dot: '#4ade80', text: 'Live buoy data is fresh and well-matched to this spot\'s calibration' });
                  } else if (surfEstimate.confidence === 'moderate') {
                    rows.push({ factor: 'Data Confidence', dot: '#fbbf24', text: 'Transformation is reasonable but not fully validated for current conditions' });
                  } else {
                    rows.push({ factor: 'Data Confidence', dot: '#ef4444', text: surfEstimate.confidenceReason });
                  }
                }

                if (rows.length === 0) return null;
                return (
                  <div style={{ border: '1px solid #1a1510', padding: '24px', margin: '24px 0' }}>
                    <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '16px' }}>
                      Why it&apos;s {verdictLabel}
                    </div>
                    {rows.map((row, i) => (
                      <div key={row.factor} style={{
                        display: 'grid', gridTemplateColumns: '180px 1fr', gap: '12px',
                        padding: '12px 0',
                        borderBottom: i < rows.length - 1 ? '1px solid #1a1510' : 'none',
                        alignItems: 'start',
                      }}>
                        <div style={{ fontSize: '13px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6b6560', paddingTop: '3px' }}>{row.factor}</div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: row.dot, flexShrink: 0, marginTop: '6px' }} />
                          <div style={{ fontSize: '14px', fontFamily: "'Georgia', serif", color: '#f0ebe0', lineHeight: 1.5 }}>{row.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* ROW 1 — Headline metrics */}
              <style>{`
                .cond-row1 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px; }
                .cond-row1.has-buoy { grid-template-columns: 1fr 1fr 1fr 1fr 1fr; }
                .cond-row1.has-buoy.has-estimate { grid-template-columns: repeat(6, 1fr); }
                .cond-row1.has-buoy.has-estimate.has-tide { grid-template-columns: repeat(6, 1fr) 1.6fr; }
                .cond-row2 { display: grid; grid-template-columns: 3fr 2fr; gap: 8px; margin-bottom: 16px; }
                @media (max-width: 1300px) {
                  .cond-row1.has-buoy.has-estimate.has-tide { grid-template-columns: repeat(4, 1fr) !important; }
                }
                @media (max-width: 1100px) {
                  .cond-row1.has-buoy.has-estimate { grid-template-columns: repeat(3, 1fr) !important; }
                }
                @media (max-width: 900px) {
                  .cond-row1.has-buoy.has-estimate.has-tide { grid-template-columns: repeat(3, 1fr) !important; }
                }
                @media (max-width: 768px) {
                  .cond-row1 { grid-template-columns: 1fr 1fr !important; }
                  .cond-row1.has-buoy { grid-template-columns: 1fr 1fr 1fr !important; }
                  .cond-row2 { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 640px) {
                  .cond-row1.has-buoy.has-estimate { grid-template-columns: repeat(2, 1fr) !important; }
                  .cond-row1.has-buoy.has-estimate.has-tide { grid-template-columns: repeat(2, 1fr) !important; }
                }
              `}</style>
              <div className={`cond-row1${showBuoy ? ' has-buoy' : ''}${surfEstimate ? ' has-estimate' : ''}${tideData ? ' has-tide' : ''}`}>
                {/* Observed (buoy) */}
                {showBuoy && (() => {
                  const isStale = buoyData!.ageMinutes > 360;
                  return (
                    <div style={{ border: '1px solid #1a1510', padding: '20px', position: 'relative', opacity: isStale ? 0.5 : 1 }}>
                      {/* Green live dot */}
                      <div
                        title={`Live data from NOAA buoy ${buoyData!.buoyId}. Observations update every 30-60 minutes.`}
                        style={{
                          position: 'absolute', top: '10px', right: '10px',
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: '#4ade80', cursor: 'help',
                        }}
                      />
                      <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '10px' }}>Live Buoy {buoyData!.buoyId}</div>
                      <div style={{ fontSize: '40px', fontFamily: "'Georgia', serif", fontWeight: 'bold', color: '#f0ebe0', lineHeight: 1 }}>
                        {buoyData!.waveHeightFt}<span style={{ fontSize: '18px' }}>ft</span>
                      </div>
                      {buoyData!.periodS !== null && (
                        <div style={{ fontSize: '14px', color: '#f0ebe0', marginTop: '6px' }}>{buoyData!.periodS}s</div>
                      )}
                      <div style={{ fontSize: '11px', color: '#6b6560', marginTop: '4px', fontStyle: isStale ? 'italic' : 'normal' }}>
                        {formatBuoyAge(buoyData!.ageMinutes)}
                      </div>
                    </div>
                  );
                })()}
                {/* At the Break (transformed estimate) */}
                {surfEstimate && (() => {
                  const confColor = surfEstimate.confidence === 'high' ? '#4ade80' : surfEstimate.confidence === 'moderate' ? '#fbbf24' : '#6b6560';
                  return (
                    <div style={{ border: '1px solid #1a1510', padding: '20px', position: 'relative' }}>
                      <div
                        title="Estimated breaker height at the spot. Calculated from live buoy data using coastal transformation (Caldwell & Aucan 2007)."
                        style={{
                          position: 'absolute', top: '10px', right: '10px',
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: '#fbbf24', cursor: 'help',
                        }}
                      />
                      <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '10px' }}>At the Break</div>
                      <div style={{ fontSize: '40px', fontFamily: "'Georgia', serif", fontWeight: 'bold', color: '#f0ebe0', lineHeight: 1 }}>
                        {surfEstimate.estimatedSurfHeightFt.toFixed(1)}<span style={{ fontSize: '18px' }}>ft</span>
                      </div>
                      <div style={{ fontSize: '11px', color: confColor, marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {surfEstimate.confidence} confidence
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b6560', marginTop: '4px', fontStyle: 'italic' }}>
                        {surfEstimate.confidenceReason}
                      </div>
                    </div>
                  );
                })()}
                {/* Wave Height */}
                <div style={{ border: '1px solid #1a1510', padding: '20px' }}>
                  <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '10px' }}>Wave Height</div>
                  <div style={{ fontSize: '40px', fontFamily: "'Georgia', serif", fontWeight: 'bold', color: '#f0ebe0', lineHeight: 1 }}>
                    {conditions.waveHeightFt ?? 'N/A'}<span style={{ fontSize: '18px' }}>ft</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b6560', marginTop: '6px' }}>{conditions.waveHeightM ?? '—'}m</div>
                  <div style={{ fontSize: '11px', color: '#4a4540', marginTop: '4px' }}>Consensus · {conditions.modelCount} models</div>
                </div>

                {/* Period */}
                <div style={{ border: '1px solid #1a1510', padding: '20px' }}>
                  <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '10px' }}>Period</div>
                  <div style={{ fontSize: '40px', fontFamily: "'Georgia', serif", fontWeight: 'bold', color: '#f0ebe0', lineHeight: 1 }}>
                    {conditions.wavePeriod ?? 'N/A'}<span style={{ fontSize: '18px' }}>s</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b6560', marginTop: '6px' }}>
                    {conditions.swellQuality === 'groundswell' ? '✓ Groundswell' : conditions.swellQuality === 'mixed' ? '~ Mixed' : '✗ Wind swell'}
                  </div>
                </div>

                {/* Wind */}
                <div style={{ border: '1px solid #1a1510', padding: '20px' }}>
                  <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '10px' }}>Wind</div>
                  <div style={{ fontSize: '40px', fontFamily: "'Georgia', serif", fontWeight: 'bold', color: '#f0ebe0', lineHeight: 1 }}>
                    {conditions.windSpeedMph ?? 'N/A'}<span style={{ fontSize: '18px' }}>mph</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b6560', marginTop: '6px' }}>{conditions.windDirectionLabel ?? '—'}</div>
                </div>

                {/* Sea Temp */}
                <div style={{ border: '1px solid #1a1510', padding: '20px' }}>
                  <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '10px' }}>Water</div>
                  {conditions.seaTempF ? (
                    <>
                      <div style={{ fontSize: '40px', fontFamily: "'Georgia', serif", fontWeight: 'bold', color: '#f0ebe0', lineHeight: 1 }}>
                        {conditions.seaTempF}<span style={{ fontSize: '18px' }}>°F</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b6560', marginTop: '6px' }}>{conditions.seaTempC}°C · {conditions.wetsuitRecommendation}</div>
                    </>
                  ) : (
                    <div style={{ fontSize: '20px', color: '#4a4540', lineHeight: 1 }}>—</div>
                  )}
                </div>

                {/* Tide */}
                {tideData && surfEstimate && (() => {
                  const nextEvent = tideData.nextHigh && tideData.nextLow
                    ? (tideData.nextHigh.minutesFromNow < tideData.nextLow.minutesFromNow ? tideData.nextHigh : tideData.nextLow)
                    : (tideData.nextHigh ?? tideData.nextLow);
                  const ht = tideData.currentHeightFt;
                  const htDisplay = ht !== null
                    ? (Math.abs(ht) < 1 ? ht.toFixed(2) : ht.toFixed(1))
                    : null;
                  const state = getTideState(tideData);
                  const label = tideStateLabel(state);
                  return (
                    <div
                      title={`Tide data from NOAA station ${tideData.stationId}. Sparkline shows 24-hour tide curve centered on now.`}
                      style={{ border: '1px solid #1a1510', padding: '20px', position: 'relative' }}
                    >
                      <div
                        style={{
                          position: 'absolute', top: '10px', right: '10px',
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: '#60a5fa',
                        }}
                      />
                      <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '4px' }}>Tide</div>
                      <div style={{ fontSize: '18px', fontFamily: "'Georgia', serif", fontWeight: 'bold', color: '#f0ebe0', letterSpacing: '0.02em', margin: '4px 0 12px 0' }}>
                        {label}
                      </div>
                      <div style={{ margin: '8px 0 12px 0', overflowX: 'hidden' }}>
                        <TideSparkline tide={tideData} width={220} height={48} />
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b6560' }}>
                        {htDisplay !== null ? `${htDisplay}ft` : '—'}
                      </div>
                      {nextEvent && (
                        <div style={{ fontSize: '11px', color: '#6b6560', marginTop: '2px' }}>
                          Next {nextEvent.type === 'H' ? 'high' : 'low'}: {formatTideTime(nextEvent)}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* ROW 2 — Directions + Swells */}
              <div className="cond-row2">
                {/* Direction bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ border: '1px solid #1a1510', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '8px' }}>Swell Direction</div>
                      <div style={{ fontSize: '11px', color: '#f0ebe0' }}>{conditions.swellDirectionScore}%</div>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} style={{
                          flex: 1, height: '4px',
                          background: i < Math.round(conditions.swellDirectionScore / 10)
                            ? (conditions.swellDirectionScore >= 70 ? '#4ade80' : conditions.swellDirectionScore >= 40 ? '#fbbf24' : '#ef4444')
                            : '#1a1510',
                        }} />
                      ))}
                    </div>
                  </div>
                  <div style={{ border: '1px solid #1a1510', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '8px' }}>Wind Direction</div>
                      <div style={{ fontSize: '11px', color: '#f0ebe0' }}>{conditions.windDirectionScore}%</div>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} style={{
                          flex: 1, height: '4px',
                          background: i < Math.round(conditions.windDirectionScore / 10)
                            ? (conditions.windDirectionScore >= 70 ? '#4ade80' : conditions.windDirectionScore >= 40 ? '#fbbf24' : '#ef4444')
                            : '#1a1510',
                        }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Swell components */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {conditions.primarySwell && (
                    <div style={{ border: '1px solid #1a1510', padding: '14px' }}>
                      <div style={{ fontSize: '10px', color: '#6b6560', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Primary Swell</div>
                      <div style={{ fontSize: '14px', color: '#f0ebe0', fontWeight: 'bold' }}>
                        {conditions.primarySwell.heightFt}ft @ {conditions.primarySwell.periodSeconds}s
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b6560', marginTop: '2px' }}>
                        {conditions.primarySwell.directionLabel} {conditions.primarySwell.directionDegrees}°
                      </div>
                    </div>
                  )}
                  {conditions.secondarySwell && (
                    <div style={{ border: '1px solid #1a1510', padding: '14px' }}>
                      <div style={{ fontSize: '10px', color: '#6b6560', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Secondary Swell</div>
                      <div style={{ fontSize: '14px', color: '#b0a898' }}>
                        {conditions.secondarySwell.heightFt}ft @ {conditions.secondarySwell.periodSeconds}s
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b6560', marginTop: '2px' }}>
                        {conditions.secondarySwell.directionLabel} {conditions.secondarySwell.directionDegrees}°
                      </div>
                    </div>
                  )}
                  {conditions.tertiarySwell && (
                    <div style={{ border: '1px solid #1a1510', padding: '14px' }}>
                      <div style={{ fontSize: '10px', color: '#6b6560', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Tertiary Swell</div>
                      <div style={{ fontSize: '14px', color: '#6b6560' }}>
                        {conditions.tertiarySwell.heightFt}ft @ {conditions.tertiarySwell.periodSeconds}s
                      </div>
                      <div style={{ fontSize: '12px', color: '#4a4540', marginTop: '2px' }}>
                        {conditions.tertiarySwell.directionLabel} {conditions.tertiarySwell.directionDegrees}°
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 10-day outlook */}
              {conditions.outlook && conditions.outlook.length > 0 && (() => {
                const days = conditions.outlook.slice(0, 10);
                const maxHeight = Math.max(...days.map((d: any) => parseFloat(d.waveHeightFt) || 0));
                const peakIdx = days.reduce((best: number, d: any, i: number) =>
                  parseFloat(d.waveHeightFt) > parseFloat(days[best].waveHeightFt) ? i : best, 0);
                const barColor = (label: string) => {
                  switch (label) {
                    case 'FIRING': return '#4ade80';
                    case 'GOOD': return '#86efac';
                    case 'FAIR': return '#fbbf24';
                    case 'BLOWN OUT': return '#6b6560';
                    default: return '#4a4540'; // SMALL, FLAT, unknown
                  }
                };
                return (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', margin: '0 0 24px 0' }}>
                      {conditions.outlook.length} Day Outlook
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '0' }}>
                      {days.map((day: any, i: number) => {
                        const ht = parseFloat(day.waveHeightFt) || 0;
                        const fillHeight = maxHeight > 0 ? Math.round((ht / maxHeight) * 120) : 4;
                        const color = barColor(day.label);
                        const isPeak = i === peakIdx;
                        return (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {/* wave height label */}
                            <div style={{ marginBottom: '6px', textAlign: 'center' }}>
                              {isPeak && (
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, margin: '0 auto 3px' }} />
                              )}
                              <div style={{ fontSize: '13px', fontFamily: "'Georgia', serif", fontWeight: 'bold', color: '#f0ebe0', lineHeight: 1 }}>
                                {ht > 0 ? `${day.waveHeightFt}ft` : '—'}
                              </div>
                            </div>
                            {/* bar */}
                            <div style={{
                              width: '100%', height: `${fillHeight}px`, minHeight: '4px',
                              background: color,
                              borderRadius: '2px 2px 0 0',
                              border: '1px solid #1a1510',
                            }} />
                            {/* day label */}
                            <div style={{ marginTop: '6px', textAlign: 'center' }}>
                              <div style={{ fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6b6560', fontWeight: isPeak ? 'bold' : 'normal' }}>
                                {day.dayLabel}
                              </div>
                              <div style={{ fontSize: '10px', color: '#4a4540', marginTop: '2px' }}>
                                ({day.periodSeconds}s)
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {conditions.bestDayThisWeek && (
                      <div style={{ marginTop: '8px', padding: '8px', background: '#111010', fontSize: '12px', color: '#4ade80' }}>
                        Best this week: {conditions.bestDayThisWeek.dayLabel} — {conditions.bestDayThisWeek.waveHeightFt}ft
                      </div>
                    )}
                    {conditions.bestDayNextWeek && (
                      <div style={{ marginTop: '4px', padding: '8px', background: '#111010', fontSize: '12px', color: '#6b6560' }}>
                        Best next week: {conditions.bestDayNextWeek.dayLabel} — {conditions.bestDayNextWeek.waveHeightFt}ft
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Swell events */}
              {conditions.swellEvents && conditions.swellEvents.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', margin: '0 0 12px 0' }}>
                    Incoming Swell Events
                  </div>
                  {conditions.swellEvents.map((event: any, i: number) => (
                    <div key={i} style={{
                      background: '#111010', padding: '12px', marginBottom: '6px',
                      borderLeft: `3px solid ${event.significance === 'epic' ? '#4ade80' : event.significance === 'solid' ? '#fbbf24' : '#4a4540'}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ fontSize: '12px', color: '#f0ebe0', fontWeight: 'bold' }}>{event.dayLabel}</div>
                        <div style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase',
                          color: event.significance === 'epic' ? '#4ade80' : event.significance === 'solid' ? '#fbbf24' : '#6b6560' }}>
                          {event.significance}
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b6560' }}>{event.description}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Model breakdown */}
              <div style={{ background: '#111010', padding: '14px', marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', margin: '0 0 10px 0' }}>Model Breakdown</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#4a4540' }}>ECMWF (45%)</span>
                  <span style={{ fontSize: '12px', color: '#f0ebe0' }}>{conditions.modelBreakdown?.ecmwf == null ? 'No data' : `${conditions.modelBreakdown.ecmwf}ft`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#4a4540' }}>ICON (35%)</span>
                  <span style={{ fontSize: '12px', color: '#f0ebe0' }}>{conditions.modelBreakdown?.icon == null ? 'No data' : `${conditions.modelBreakdown.icon}ft`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#4a4540' }}>GFS (20%)</span>
                  <span style={{ fontSize: '12px', color: '#f0ebe0' }}>{conditions.modelBreakdown?.gfs == null ? 'No data' : `${conditions.modelBreakdown.gfs}ft`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#4a4540' }}>Model confidence</span>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px',
                    background: conditions.confidenceScore >= 80 ? '#4ade8022' : conditions.confidenceScore >= 60 ? '#fbbf2422' : '#ef444422',
                    color: conditions.confidenceScore >= 80 ? '#4ade80' : conditions.confidenceScore >= 60 ? '#fbbf24' : '#ef4444',
                    border: `1px solid ${conditions.confidenceScore >= 80 ? '#4ade80' : conditions.confidenceScore >= 60 ? '#fbbf24' : '#ef4444'}`,
                  }}>
                    {conditions.confidenceScore}%
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '11px', color: '#4a4540', textAlign: 'center' as const, marginTop: '8px' }}>
                Updated every 30 mins · Open-Meteo ECMWF + ICON + GFS
              </div>

              {conditions.dataNote && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #1a1510', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#6b6560" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="9" x2="12" y2="13" stroke="#6b6560" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="12" y1="17" x2="12.01" y2="17" stroke="#6b6560" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <div style={{ fontSize: '11px', color: '#6b6560', fontStyle: 'italic', lineHeight: 1.5 }}>{conditions.dataNote}</div>
                </div>
              )}
            </>
          )}

          {!isSurf && conditions && (
            <>
              {/* Verdict */}
              <div style={{ background: '#111010', borderLeft: '3px solid #f0ebe0', padding: '16px 20px', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', margin: '0 0 8px 0' }}>Conditions Summary</div>
                <div style={{ fontSize: '14px', color: '#b0a898', lineHeight: 1.7 }}>{conditions.verdict}</div>
              </div>

              {/* Season badge + 7-day total */}
              <div style={{ background: '#111010', padding: '20px', textAlign: 'center' as const, marginBottom: '8px', position: 'relative' as const }}>
                {conditions.seasonType && (
                  <div style={{
                    position: 'absolute' as const, top: '10px', right: '10px', fontSize: '10px',
                    padding: '3px 8px', letterSpacing: '1px', textTransform: 'uppercase',
                    background: conditions.seasonType === 'peak' ? '#4ade8022' : conditions.seasonType === 'early' ? '#fbbf2422' : '#6b656022',
                    color: conditions.seasonType === 'peak' ? '#4ade80' : conditions.seasonType === 'early' ? '#fbbf24' : '#6b6560',
                    border: `1px solid ${conditions.seasonType === 'peak' ? '#4ade80' : conditions.seasonType === 'early' ? '#fbbf24' : '#6b6560'}`,
                  }}>
                    {conditions.seasonType} season
                  </div>
                )}
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#f0ebe0', lineHeight: 1 }}>
                  {conditions.forecastSnow7DayIn ?? '0'}<span style={{ fontSize: '20px' }}>"</span>
                </div>
                <div style={{ fontSize: '13px', color: '#4a4540', marginTop: '4px' }}>{conditions.forecastSnow7DayCm}cm</div>
                <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '6px' }}>7 Day Forecast Snowfall</div>
              </div>

              {/* Fresh snow 24/48/72h */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                {[
                  { label: '24h', in: conditions.freshSnow24hIn, cm: conditions.freshSnow24hCm },
                  { label: '48h', in: conditions.freshSnow48hIn, cm: conditions.freshSnow48hCm },
                  { label: '72h', in: conditions.freshSnow72hIn, cm: conditions.freshSnow72hCm },
                ].map(({ label, in: inches, cm }) => (
                  <div key={label} style={{ background: '#111010', padding: '12px', textAlign: 'center' as const }}>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f0ebe0' }}>
                      {inches ?? '0'}<span style={{ fontSize: '11px' }}>"</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#4a4540', marginTop: '2px' }}>{cm ?? 0}cm</div>
                    <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Temp / Depth / Wind grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                <div style={{ background: '#111010', padding: '14px', textAlign: 'center' as const }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f0ebe0' }}>
                    {conditions.tempLowF ?? '—'}°F
                  </div>
                  <div style={{ fontSize: '11px', color: '#4a4540', marginTop: '2px' }}>{conditions.tempLowC ?? '—'}°C</div>
                  <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Low Temp</div>
                </div>
                <div style={{ background: '#111010', padding: '14px', textAlign: 'center' as const }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f0ebe0' }}>
                    {conditions.snowDepthIn ?? '—'}<span style={{ fontSize: '12px' }}>"</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#4a4540', marginTop: '2px' }}>{conditions.snowDepthCm ?? '—'}cm</div>
                  <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Snow Depth</div>
                </div>
                <div style={{ background: '#111010', padding: '14px', textAlign: 'center' as const }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f0ebe0' }}>
                    {conditions.windSpeedMph ?? '—'}<span style={{ fontSize: '12px' }}>mph</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Wind</div>
                </div>
                <div style={{ background: '#111010', padding: '14px', textAlign: 'center' as const }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: conditions.chanceOfSnow && conditions.chanceOfSnow >= 50 ? '#a8d8f0' : '#f0ebe0' }}>
                    {conditions.chanceOfSnow ?? '—'}%
                  </div>
                  <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Snow Chance</div>
                </div>
              </div>

              {/* Snow type badge */}
              {conditions.snowType && (
                <div style={{ background: '#111010', padding: '12px 16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#4a4540', textTransform: 'uppercase', letterSpacing: '1px' }}>Snow Type</span>
                  <span style={{
                    fontSize: '11px', padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '1px',
                    background: conditions.snowType === 'powder' ? '#a8d8f022' : '#6b656022',
                    color: conditions.snowType === 'powder' ? '#a8d8f0' : '#6b6560',
                    border: `1px solid ${conditions.snowType === 'powder' ? '#a8d8f0' : '#6b6560'}`,
                  }}>
                    {conditions.snowType}
                  </span>
                </div>
              )}

              {/* Powder day / storm window */}
              {conditions.nextPowderDay && (
                <div style={{ background: '#111010', borderLeft: '3px solid #a8d8f0', padding: '12px 16px', marginBottom: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#a8d8f0', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Next Powder Day</div>
                  <div style={{ fontSize: '13px', color: '#f0ebe0' }}>
                    {conditions.nextPowderDay.dayLabel} — {conditions.nextPowderDay.snowIn}" ({conditions.nextPowderDay.snowCm}cm)
                  </div>
                </div>
              )}
              {conditions.nextStormWindow && (
                <div style={{ background: '#111010', borderLeft: '3px solid #fbbf24', padding: '12px 16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '10px', color: '#fbbf24', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Storm Window</div>
                  <div style={{ fontSize: '13px', color: '#f0ebe0' }}>{conditions.nextStormWindow.description}</div>
                </div>
              )}

              {/* 10-day outlook */}
              {conditions.outlook && conditions.outlook.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '10px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
                    {conditions.outlook.length} Day Outlook
                  </div>
                  {conditions.outlook.slice(0, 10).map((day: any, i: number) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 0', borderBottom: '1px solid #1a1510',
                      background: day.isPowderDay ? 'rgba(168,216,240,0.04)' : 'transparent',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {day.isPowderDay && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#a8d8f0' }} />}
                        <div style={{ fontSize: '13px', color: day.isPowderDay ? '#f0ebe0' : '#4a4540' }}>{day.dayLabel}</div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#4a4540' }}>{day.tempHighF}°F</div>
                      <div style={{ fontSize: '14px', fontWeight: day.isPowderDay ? 'bold' : 'normal', color: '#a8d8f0' }}>
                        {day.snowIn}"
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Model breakdown */}
              <div style={{ background: '#111010', padding: '14px', marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', margin: '0 0 10px 0' }}>Model Breakdown</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#4a4540' }}>ECMWF</span>
                  <span style={{ fontSize: '12px', color: '#f0ebe0' }}>{conditions.modelBreakdown?.ecmwfSnowIn ?? '—'}"</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#4a4540' }}>ICON</span>
                  <span style={{ fontSize: '12px', color: '#f0ebe0' }}>{conditions.modelBreakdown?.iconSnowIn ?? '—'}"</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#4a4540' }}>GFS</span>
                  <span style={{ fontSize: '12px', color: '#f0ebe0' }}>{conditions.modelBreakdown?.gfsSnowIn ?? '—'}"</span>
                </div>
                {conditions.modelBreakdown?.wwoSnowIn && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', color: '#4a4540' }}>WorldWeatherOnline</span>
                    <span style={{ fontSize: '12px', color: '#f0ebe0' }}>{conditions.modelBreakdown.wwoSnowIn}"</span>
                  </div>
                )}
              </div>

              <div style={{ fontSize: '11px', color: '#4a4540', textAlign: 'center' as const, marginTop: '8px' }}>
                Updated every 30 mins · Open-Meteo + WorldWeatherOnline
              </div>
            </>
          )}
        </div>
      </div>}

          {/* ABOUT */}
          <div style={{ padding: '24px 60px', borderBottom: '1px solid #1a1510' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '12px' }}>
              About
            </div>
            <p style={{ fontSize: '18px', lineHeight: 1.7, color: '#f0ebe0', margin: 0, maxWidth: '680px' }}>
              {spot.description}
            </p>
          </div>

          {/* THE BREAK / MOUNTAIN + IDEAL CONDITIONS */}
          {(spot.bestBreak || spot.bestRun || spot.idealConditions) && (
            <div style={{ padding: '24px 60px', borderBottom: '1px solid #1a1510' }}>
              <style>{`
                .break-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
                @media (max-width: 768px) { .break-grid { grid-template-columns: 1fr !important; } .break-col-left { border-right: none !important; } }
              `}</style>
              <div className="break-grid">
                <div className="break-col-left" style={{ paddingRight: '32px', borderRight: '1px solid #1a1510' }}>
                  <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '12px' }}>
                    {isSurf ? 'The Break' : 'The Mountain'}
                  </div>
                  <p style={{ fontSize: '16px', fontFamily: "'Georgia', serif", lineHeight: 1.6, color: '#f0ebe0', margin: 0 }}>
                    {isSurf ? spot.bestBreak : spot.bestRun}
                  </p>
                </div>
                {spot.idealConditions && (
                  <div style={{ padding: '0' }}>
                    <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '12px' }}>
                      Ideal Conditions
                    </div>
                    <p style={{ fontSize: '16px', fontFamily: "'Georgia', serif", lineHeight: 1.6, color: '#f0ebe0', margin: 0 }}>
                      {spot.idealConditions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BEST MONTHS */}
          <div style={{ padding: '24px 60px', borderBottom: '1px solid #1a1510' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', margin: '0 0 12px 0' }}>
              Best Months
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {MONTH_NAMES.map((month, i) => {
                const monthNum = i + 1;
                const isBest = spot.bestMonths.includes(monthNum);
                const isCurrent = monthNum === currentMonth;
                return (
                  <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* current month dot */}
                    <div style={{ height: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                      {isCurrent && (
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#fbbf24' }} />
                      )}
                    </div>
                    {/* month label */}
                    <div style={{ fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: isBest ? '#f0ebe0' : '#4a4540', marginBottom: '6px', fontWeight: isBest ? 'bold' : 'normal' }}>
                      {month.slice(0, 3)}
                    </div>
                    {/* bar — fixed 8px container so all columns are same height */}
                    <div style={{ width: '100%', height: '8px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                      <div style={{
                        width: '100%',
                        height: isBest ? '8px' : '4px',
                        background: isBest ? '#4ade80' : '#2a2520',
                        borderRadius: '1px',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '12px', fontSize: '11px', color: '#6b6560' }}>
              Best months highlighted · Current: {MONTH_NAMES[currentMonth - 1]}
            </div>
          </div>

          {/* ITINERARIES */}
          <div style={{ padding: '24px 60px', borderBottom: '1px solid #1a1510' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', margin: '0 0 12px 0' }}>
              Trip Planner
            </div>

            {spot.weekendTrip && (
              <div style={{ border: '1px solid #1a1510', padding: '32px', marginBottom: '24px' }}>
                <div style={{ fontSize: '24px', fontFamily: "'Georgia', serif", letterSpacing: '-1px', color: '#f0ebe0', marginBottom: '6px' }}>
                  {spot.weekendTrip.title}
                </div>
                <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '24px' }}>Weekend · 3 Days</div>
                {spot.weekendTrip.days.map((day: any, i: number) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '16px', paddingBottom: '16px', marginBottom: i < spot.weekendTrip.days.length - 1 ? '16px' : 0, borderBottom: i < spot.weekendTrip.days.length - 1 ? '1px solid #1a1510' : 'none' }}>
                    <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', paddingTop: '2px' }}>{day.day}</div>
                    <div style={{ fontSize: '14px', fontFamily: "'Georgia', serif", color: '#f0ebe0', lineHeight: 1.5 }}>{day.plan}</div>
                  </div>
                ))}
              </div>
            )}

            {spot.weekTrip && (
              <div style={{ border: '1px solid #1a1510', padding: '32px', marginBottom: '24px' }}>
                <div style={{ fontSize: '24px', fontFamily: "'Georgia', serif", letterSpacing: '-1px', color: '#f0ebe0', marginBottom: '6px' }}>
                  {spot.weekTrip.title}
                </div>
                <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '24px' }}>Full Week · 7 Days</div>
                {spot.weekTrip.days.map((day: any, i: number) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '16px', paddingBottom: '16px', marginBottom: i < spot.weekTrip.days.length - 1 ? '16px' : 0, borderBottom: i < spot.weekTrip.days.length - 1 ? '1px solid #1a1510' : 'none' }}>
                    <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', paddingTop: '2px' }}>{day.day}</div>
                    <div style={{ fontSize: '14px', fontFamily: "'Georgia', serif", color: '#f0ebe0', lineHeight: 1.5 }}>{day.plan}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LOCAL TIPS */}
          {spot.localTips && spot.localTips.length > 0 && (
            <div style={{ padding: '24px 60px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', margin: '0 0 12px 0' }}>
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

          {/* FORECAST UNAVAILABLE — shown for LOW confidence surf spots */}
          {isLowConfidence && (
            <div style={{ padding: '24px', borderBottom: '1px solid #1a1510' }}>
              <div style={{ border: '1px solid #1a1510', padding: '20px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '8px' }}>Forecast</div>
                <div style={{ fontSize: '13px', color: '#4a4540', lineHeight: 1.5 }}>Forecast unavailable for this spot</div>
              </div>
            </div>
          )}

          {/* BEST WINDOW — hidden for LOW confidence surf spots */}
          {bestWindow && !isLowConfidence && (
            <div style={{ padding: '24px', borderBottom: '1px solid #1a1510' }}>
              <div style={{ background: '#1a1510', border: '1px solid #2a2520', padding: '24px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', marginBottom: '16px' }}>
                  Best Window
                </div>
                <div style={{ fontSize: '14px', color: '#f0ebe0', marginBottom: '8px' }}>
                  Day {bestWindow.dayIndex} · {bestWindow.date}
                </div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f0ebe0', marginBottom: '12px', fontFamily: "'Georgia', serif" }}>
                  {bestWindow.height}{bestWindow.period}
                </div>
                <div style={{
                  fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: (bestWindow.condLabel === 'FIRING' || bestWindow.condLabel === 'POWDER DAY') ? '#4ade80' :
                         (bestWindow.condLabel === 'GOOD' || bestWindow.condLabel === 'GOOD SNOW') ? '#86efac' :
                         (bestWindow.condLabel === 'FAIR' || bestWindow.condLabel === 'SKIABLE') ? '#fbbf24' :
                         (bestWindow.condLabel === 'BLOWN OUT' || bestWindow.condLabel === 'ICY') ? '#6b6560' : '#4a4540',
                }}>
                  {bestWindow.condLabel}
                </div>
              </div>
            </div>
          )}

          {/* TRIP COST */}
          <div style={{ padding: '32px', borderBottom: '1px solid #1a1510' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', margin: '0 0 12px 0' }}>
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
