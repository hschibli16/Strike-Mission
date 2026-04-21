import GuideSearch from './components/GuideSearch';
import GuideExplorer from './components/GuideExplorer';
import { getAllRegions, getSpotsFromDB } from './lib/getSpots';
import { getSpotConfidence } from './lib/spot-confidence';

export default async function Home() {
  const [allRegions, allSpots] = await Promise.all([getAllRegions(), getSpotsFromDB()]);
  const spotCountByRegion: Record<string, number> = {};
  allSpots.forEach(s => {
    spotCountByRegion[s.regionSlug] = (spotCountByRegion[s.regionSlug] ?? 0) + 1;
  });

  const currentMonth = new Date().getMonth() + 1;
  const firingSpots = allSpots
    .filter(s => {
      if (s.type !== 'surf') return false;
      return getSpotConfidence(s).tier !== 'low';
    })
    .map(s => {
      let score = 0;
      if (s.buoyId) score += 30;
      if (typeof s.refractionCoefficient === 'number') score += 10;
      if (s.bestMonths && s.bestMonths.includes(currentMonth)) score += 50;
      if (s.tideStationId) score += 5;
      return { spot: s, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(x => x.spot);

  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const powderSpots = allSpots
    .filter(s => s.type === 'ski')
    .map(s => {
      let score = 0;
      if (s.bestMonths && s.bestMonths.includes(currentMonth)) score += 50;
      if (s.bestMonths && (s.bestMonths.includes(prevMonth) || s.bestMonths.includes(nextMonth))) {
        score += 20;
      }
      return { spot: s, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(x => x.spot);

  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#0a0808', minHeight: '100vh', color: '#f0ebe0' }}>

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '16px 40px', display: 'flex', alignItems: 'center',
        background: 'rgba(10,8,8,0.97)', borderBottom: '1px solid #1a1510'
      }}>
        <a href="/" style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase', color: '#f0ebe0', textDecoration: 'none' }}>
          Strike Mission
        </a>
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
          <GuideSearch
            regions={allRegions.map(r => ({ slug: r.slug, name: r.name, type: r.type, countries: r.countries }))}
            spots={allSpots.map(s => ({ slug: s.slug, name: s.name, location: s.location, country: s.country, type: s.type }))}
          />
        </div>
      </div>

      {/* GUIDE EXPLORER */}
      <div style={{ padding: '0 60px 80px' }}>
        <GuideExplorer
          regions={allRegions.map(r => ({ slug: r.slug, name: r.name, type: r.type, countries: r.countries, centroidLat: r.centroidLat, centroidLon: r.centroidLon, focusZoom: r.focusZoom }))}
          spotCountByRegion={spotCountByRegion}
          firingSpots={firingSpots}
          powderSpots={powderSpots}
          allSpots={allSpots}
        />
      </div>

    </main>
  );
}
