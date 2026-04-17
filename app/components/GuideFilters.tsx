'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const SpotMap = dynamic(() => import('./SpotMap'), { ssr: false });

const REGION_MAP: Record<string, string> = {
  'USA': 'Americas', 'Canada': 'Americas', 'Mexico': 'Americas',
  'Nicaragua': 'Americas', 'Costa Rica': 'Americas', 'Peru': 'Americas',
  'Chile': 'Americas', 'Brazil': 'Americas',
  'France': 'Europe', 'Spain': 'Europe', 'Portugal': 'Europe',
  'Switzerland': 'Europe', 'Austria': 'Europe', 'Italy': 'Europe',
  'Ireland': 'Europe', 'Norway': 'Europe',
  'Morocco': 'Africa', 'Namibia': 'Africa', 'South Africa': 'Africa',
  'Indonesia': 'Asia Pacific', 'Japan': 'Asia Pacific',
  'Australia': 'Asia Pacific', 'New Zealand': 'Asia Pacific',
  'Fiji': 'Asia Pacific', 'French Polynesia': 'Asia Pacific',
};

export default function GuideFilters({ surfSpots, skiSpots, totalCount }: {
  surfSpots: any[];
  skiSpots: any[];
  totalCount: number;
}) {
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [typeFilter, setTypeFilter] = useState<'all' | 'surf' | 'ski'>('all');
  const [regionFilter, setRegionFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');
  const [search, setSearch] = useState('');
  const currentMonth = new Date().getMonth() + 1;

  const regions = ['All', 'Americas', 'Europe', 'Asia Pacific', 'Africa'];
  const conditions = ['All', 'Firing', 'Good', 'Fair'];

  function filterSpots(spots: any[]) {
    return spots.filter(spot => {
      const region = REGION_MAP[spot.country] ?? 'Other';
      const matchesRegion = regionFilter === 'All' || region === regionFilter;
      const matchesSearch = search === '' ||
        spot.name.toLowerCase().includes(search.toLowerCase()) ||
        spot.location.toLowerCase().includes(search.toLowerCase()) ||
        spot.country.toLowerCase().includes(search.toLowerCase());
      const matchesCondition = conditionFilter === 'All' ||
        spot.strike?.label?.toLowerCase().includes(conditionFilter.toLowerCase());
      return matchesRegion && matchesSearch && matchesCondition;
    });
  }

  const showSurf = typeFilter === 'all' || typeFilter === 'surf';
  const showSki = typeFilter === 'all' || typeFilter === 'ski';
  const filteredSurf = showSurf ? filterSpots(surfSpots) : [];
  const filteredSki = showSki ? filterSpots(skiSpots) : [];
  const totalShown = filteredSurf.length + filteredSki.length;

  const activeBtn = {
    padding: '8px 16px', fontSize: '11px', letterSpacing: '2px',
    textTransform: 'uppercase' as const, cursor: 'pointer',
    background: '#f0ebe0', color: '#0a0808', border: 'none',
    fontFamily: 'Georgia, serif', fontWeight: 'bold' as const,
  };
  const inactiveBtn = {
    padding: '8px 16px', fontSize: '11px', letterSpacing: '2px',
    textTransform: 'uppercase' as const, cursor: 'pointer',
    background: 'transparent', color: '#4a4540', border: '1px solid #2a2520',
    fontFamily: 'Georgia, serif', fontWeight: 'normal' as const,
  };

  const mapSpots = [
    ...filteredSurf.map(s => ({
      slug: s.slug, name: s.name, location: s.location,
      lat: s.lat, lon: s.lon, type: 'surf' as const,
      label: s.strike?.label ?? '', bg: s.strike?.bg ?? '#4a4540',
      waveHeight: s.swell?.waveHeightFt, period: s.swell?.wavePeriod,
    })),
    ...filteredSki.map(r => ({
      slug: r.slug, name: r.name, location: r.location,
      lat: r.lat, lon: r.lon, type: 'ski' as const,
      label: r.strike?.label ?? '', bg: r.strike?.bg ?? '#4a4540',
      totalSnowIn: r.totalSnowIn,
    })),
  ];

  return (
    <div>
      {/* STICKY FILTER BAR */}
      <div style={{
        padding: '12px 60px',
        borderTop: '1px solid #1a1510',
        borderBottom: '1px solid #1a1510',
        display: 'flex', gap: '12px', alignItems: 'center',
        flexWrap: 'wrap' as const,
        position: 'sticky', top: '61px',
        background: 'rgba(10,8,8,0.97)', zIndex: 90,
      }}>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter..."
          style={{
            padding: '8px 12px', background: '#111010',
            border: '1px solid #2a2520', color: '#f0ebe0',
            fontSize: '13px', fontFamily: 'Georgia, serif', outline: 'none', width: '120px',
          }}
        />

        <div style={{ width: '1px', height: '20px', background: '#2a2520' }} />

        {/* Type */}
        <div style={{ display: 'flex', gap: '2px' }}>
          {(['all', 'surf', 'ski'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              style={typeFilter === t ? activeBtn : inactiveBtn}>
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '20px', background: '#2a2520' }} />

        {/* Region */}
        <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' as const }}>
          {regions.map(r => (
            <button key={r} onClick={() => setRegionFilter(r)}
              style={regionFilter === r ? activeBtn : inactiveBtn}>
              {r}
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '20px', background: '#2a2520' }} />

        {/* Condition */}
        <div style={{ display: 'flex', gap: '2px' }}>
          {conditions.map(c => (
            <button key={c} onClick={() => setConditionFilter(c)}
              style={conditionFilter === c ? activeBtn : inactiveBtn}>
              {c}
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '20px', background: '#2a2520' }} />

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '2px' }}>
          <button onClick={() => setView('grid')} style={view === 'grid' ? activeBtn : inactiveBtn}>
            Grid
          </button>
          <button onClick={() => {
            setView('map');
            setTimeout(() => {
              window.dispatchEvent(new Event('resize'));
            }, 100);
          }} style={view === 'map' ? activeBtn : inactiveBtn}>
            Map
          </button>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#4a4540' }}>
          {totalShown} of {totalCount} spots
        </div>
      </div>

      {/* MAP VIEW */}
      {view === 'map' && (
        <div>
          <SpotMap spots={mapSpots} />
          <div style={{
            padding: '12px 60px', background: '#0a0808',
            borderTop: '1px solid #1a1510',
            display: 'flex', gap: '24px', alignItems: 'center',
          }}>
            {[
              { color: '#4ade80', label: 'Firing / Powder Day' },
              { color: '#86efac', label: 'Good Snow' },
              { color: '#fbbf24', label: 'Fair / Skiable' },
              { color: '#4a4540', label: 'Flat / Bare' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
                <span style={{ fontSize: '12px', color: '#6b6560' }}>{label}</span>
              </div>
            ))}
            <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#4a4540' }}>
              {totalShown} spots shown · click any pin for details
            </div>
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {view === 'grid' && (
        <div style={{ padding: '40px 60px' }}>

          {/* SURF */}
          {filteredSurf.length > 0 && (
            <div style={{ marginBottom: '64px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.4, marginBottom: '24px' }}>
                {filteredSurf.length} surf destinations
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px' }}>
                {filteredSurf.map((spot, i) => (
                  <a key={spot.slug} href={`/spot/${spot.slug}`} style={{ textDecoration: 'none' }}>
                    <div className="spot-card" style={{
                      background: '#111010', padding: '20px', height: '100%',
                      borderTop: i === 0 ? '2px solid #f0ebe0' : '1px solid #1a1510',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{
                          fontSize: '9px', letterSpacing: '2px', padding: '3px 8px',
                          background: spot.strike?.bg ?? '#4a4540',
                          color: spot.strike?.color ?? '#f0ebe0', fontWeight: 'bold',
                        }}>
                          {spot.strike?.label ?? 'N/A'}
                        </div>
                        {spot.bestMonths?.includes(currentMonth) && (
                          <div style={{ fontSize: '9px', color: '#4ade80', letterSpacing: '1px' }}>IN SEASON</div>
                        )}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '2px', color: '#f0ebe0' }}>{spot.name}</div>
                      <div style={{ fontSize: '11px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>{spot.location}</div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f0ebe0' }}>
                            {spot.swell?.waveHeightFt ?? 'N/A'}<span style={{ fontSize: '11px' }}>ft</span>
                          </div>
                          <div style={{ fontSize: '10px', color: '#4a4540', textTransform: 'uppercase', letterSpacing: '1px' }}>Waves</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f0ebe0' }}>
                            {spot.swell?.wavePeriod ?? '—'}<span style={{ fontSize: '11px' }}>s</span>
                          </div>
                          <div style={{ fontSize: '10px', color: '#4a4540', textTransform: 'uppercase', letterSpacing: '1px' }}>Period</div>
                        </div>
                      </div>
                      <div style={{ marginTop: '10px', fontSize: '12px', color: '#4a4540' }}>
                        ~\${spot.flightPrice} flights · \${spot.hotelPrice}/night
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* SKI */}
          {filteredSki.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.4, marginBottom: '24px' }}>
                {filteredSki.length} ski destinations
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px' }}>
                {filteredSki.map((resort, i) => (
                  <a key={resort.slug} href={`/spot/${resort.slug}`} style={{ textDecoration: 'none' }}>
                    <div className="spot-card" style={{
                      background: '#111010', padding: '20px', height: '100%',
                      borderTop: i === 0 ? '2px solid #f0ebe0' : '1px solid #1a1510',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{
                          fontSize: '9px', letterSpacing: '2px', padding: '3px 8px',
                          background: resort.strike?.bg ?? '#4a4540',
                          color: resort.strike?.color ?? '#f0ebe0', fontWeight: 'bold',
                        }}>
                          {resort.strike?.label ?? 'N/A'}
                        </div>
                        {resort.bestMonths?.includes(currentMonth) && (
                          <div style={{ fontSize: '9px', color: '#4ade80', letterSpacing: '1px' }}>IN SEASON</div>
                        )}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '2px', color: '#f0ebe0' }}>{resort.name}</div>
                      <div style={{ fontSize: '11px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>{resort.location}</div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f0ebe0' }}>
                            {resort.totalSnowIn}<span style={{ fontSize: '11px' }}>"</span>
                          </div>
                          <div style={{ fontSize: '10px', color: '#4a4540', textTransform: 'uppercase', letterSpacing: '1px' }}>Snow</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f0ebe0' }}>~\${resort.flightPrice}</div>
                          <div style={{ fontSize: '10px', color: '#4a4540', textTransform: 'uppercase', letterSpacing: '1px' }}>Flights</div>
                        </div>
                      </div>
                      <div style={{ marginTop: '10px', fontSize: '12px', color: '#4a4540' }}>
                        ~\${resort.flightPrice + resort.hotelPrice * 5} for 5 days
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* NO RESULTS */}
          {totalShown === 0 && (
            <div style={{ textAlign: 'center' as const, padding: '80px', color: '#4a4540' }}>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>No spots found</div>
              <div style={{ fontSize: '14px' }}>Try a different filter or region</div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
