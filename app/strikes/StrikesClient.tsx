'use client';
import { useState } from 'react';

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
  'Philippines': 'Asia Pacific', 'Barbados': 'Americas',
};

type Spot = {
  slug: string;
  name: string;
  location: string;
  country: string;
  type: 'surf' | 'ski';
  flag: string;
  description: string;
  airportCode: string;
  flightPrice: number;
  hotelPrice: number;
  tripCost: number;
  score: number;
  bestMonths: number[];
  rating: { label: string; color: string; bg: string };
  swell?: {
    waveHeightFt: string | null;
    waveHeight: string | null;
    wavePeriod: string | null;
    windSpeed: string | null;
  } | null;
  totalSnowIn?: string;
  totalSnowCm?: string;
};

function getGoogleFlightsUrl(airportCode: string) {
  const today = new Date();
  const friday = new Date(today);
  friday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));
  const sunday = new Date(friday);
  sunday.setDate(friday.getDate() + 9);
  const fmt = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '');
  return `https://www.google.com/flights/#search;f=JFK;t=${airportCode};d=${fmt(friday)};r=${fmt(sunday)};tt=r`;
}

const SURF_IMAGES = [
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=80',
  'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&q=80',
  'https://images.unsplash.com/photo-1455729552865-3658a5d39692?w=600&q=80',
  'https://images.unsplash.com/photo-1531722569936-825d4ebd89c8?w=600&q=80',
  'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=600&q=80',
];

const SNOW_IMAGES = [
  'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80',
  'https://images.unsplash.com/photo-1520208422220-d12a3c588e6c?w=600&q=80',
  'https://images.unsplash.com/photo-1548777123-e216912df7d8?w=600&q=80',
  'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&q=80',
  'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=600&q=80',
];

export default function StrikesClient({ surfSpots, snowSpots }: { surfSpots: Spot[], snowSpots: Spot[] }) {
  const [activeRegion, setActiveRegion] = useState('All');
  const [activeType, setActiveType] = useState<'both' | 'surf' | 'ski'>('both');
  const [search, setSearch] = useState('');
  const currentMonth = new Date().getMonth() + 1;

  const REGIONS = ['All', 'Americas', 'Europe', 'Asia Pacific', 'Africa'];

  const filterSpots = (spots: Spot[]) => {
    return spots.filter(spot => {
      const region = REGION_MAP[spot.country] ?? 'Other';
      const matchesRegion = activeRegion === 'All' || region === activeRegion;
      if (search === '') return matchesRegion;
      const searchLower = search.toLowerCase();
      const searchable = [spot.name, spot.location, spot.country, spot.description ?? ''].join(' ').toLowerCase();
      const words = searchLower.split(' ').filter(w => w.length > 0);
      const matchesSearch = words.every(word => searchable.includes(word));
      return matchesRegion && matchesSearch;
    });
  };

  const filteredSurf = filterSpots(surfSpots);
  const filteredSnow = filterSpots(snowSpots);
  const showSurf = activeType === 'both' || activeType === 'surf';
  const showSnow = activeType === 'both' || activeType === 'ski';

  const activeBtn = {
    padding: '10px 20px', fontSize: '12px', letterSpacing: '2px',
    textTransform: 'uppercase' as const, cursor: 'pointer', border: 'none',
    background: '#f0ebe0', color: '#0a0808', fontFamily: 'Georgia, serif',
    fontWeight: 'bold' as const,
  };
  const inactiveBtn = {
    padding: '10px 20px', fontSize: '12px', letterSpacing: '2px',
    textTransform: 'uppercase' as const, cursor: 'pointer',
    background: 'transparent', color: '#4a4540', border: '1px solid #2a2520',
    fontFamily: 'Georgia, serif', fontWeight: 'normal' as const,
  };

  return (
    <div>
      <style>{`
        .strikes-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-bottom: 48px; }
        @media (max-width: 1024px) { .strikes-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px) { .strikes-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* FILTERS */}
      <div style={{
        padding: '16px 60px', borderBottom: '1px solid #1a1510',
        display: 'flex', gap: '12px', alignItems: 'center',
        flexWrap: 'wrap' as const, position: 'sticky', top: '61px',
        background: 'rgba(10,8,8,0.97)', zIndex: 90,
      }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search spots..."
          style={{
            padding: '10px 14px', background: '#111010', border: '1px solid #2a2520',
            color: '#f0ebe0', fontSize: '13px', fontFamily: 'Georgia, serif',
            outline: 'none', width: '180px',
          }}
        />

        <div style={{ width: '1px', height: '20px', background: '#2a2520' }} />

        <div style={{ display: 'flex', gap: '2px' }}>
          {(['both', 'surf', 'ski'] as const).map(t => (
            <button key={t} onClick={() => setActiveType(t)} style={activeType === t ? activeBtn : inactiveBtn}>
              {t === 'both' ? 'All' : t === 'surf' ? 'Surf' : 'Ski'}
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '20px', background: '#2a2520' }} />

        <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' as const }}>
          {REGIONS.map(region => (
            <button key={region} onClick={() => setActiveRegion(region)} style={activeRegion === region ? activeBtn : inactiveBtn}>
              {region}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#4a4540' }}>
          {(showSurf ? filteredSurf.length : 0) + (showSnow ? filteredSnow.length : 0)} destinations
        </div>
      </div>

      <div style={{ padding: '48px 60px' }}>

        {/* SURF */}
        {showSurf && filteredSurf.length > 0 && (
          <div style={{ marginBottom: '72px' }}>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.4, marginBottom: '8px' }}>
                {filteredSurf.length} surf destinations · ranked by live score
              </div>
              <h2 style={{ fontSize: '40px', fontWeight: 'bold', margin: 0, letterSpacing: '-1px' }}>
                Surf Strikes
              </h2>
            </div>

            <div className="strikes-grid">
              {filteredSurf.map((spot, i) => (
                <div key={spot.slug} style={{
                  background: '#111010',
                  borderTop: i === 0 ? '2px solid #f0ebe0' : '1px solid #1a1510',
                  overflow: 'hidden',
                }}>
                  <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={SURF_IMAGES[i % SURF_IMAGES.length]}
                      alt={spot.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6) contrast(1.1)' }}
                    />
                    <div style={{
                      position: 'absolute', top: '12px', left: '12px',
                      background: spot.rating.bg, color: spot.rating.color,
                      fontSize: '10px', letterSpacing: '2px', padding: '3px 10px', fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                    }}>
                      {spot.rating.label}
                    </div>
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      background: 'rgba(10,8,8,0.7)', color: '#f0ebe0',
                      fontSize: '10px', letterSpacing: '1px', padding: '3px 8px',
                    }}>
                      #{i + 1} · {spot.score}/100
                    </div>
                    {spot.bestMonths.includes(currentMonth) && (
                      <div style={{
                        position: 'absolute', bottom: '12px', left: '12px',
                        fontSize: '9px', color: '#4ade80', letterSpacing: '1px',
                      }}>
                        IN SEASON
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '24px' }}>
                    <a href={`/spot/${spot.slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f0ebe0', marginBottom: '2px' }}>{spot.name}</div>
                    </a>
                    <div style={{ fontSize: '12px', color: '#4a4540', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>{spot.location}</div>
                    <div style={{ fontSize: '13px', color: '#6b6560', marginBottom: '20px', lineHeight: 1.5 }}>{spot.description}</div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                      <div style={{ background: '#0a0808', padding: '12px', textAlign: 'center' as const }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f0ebe0' }}>
                          {spot.swell?.waveHeightFt ?? 'N/A'}<span style={{ fontSize: '11px' }}>ft</span>
                        </div>
                        <div style={{ fontSize: '9px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Height</div>
                      </div>
                      <div style={{ background: '#0a0808', padding: '12px', textAlign: 'center' as const }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f0ebe0' }}>
                          {spot.swell?.wavePeriod ?? 'N/A'}<span style={{ fontSize: '11px' }}>s</span>
                        </div>
                        <div style={{ fontSize: '9px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Period</div>
                      </div>
                      <div style={{ background: '#0a0808', padding: '12px', textAlign: 'center' as const }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f0ebe0' }}>
                          {spot.swell?.windSpeed ?? 'N/A'}<span style={{ fontSize: '11px' }}>mph</span>
                        </div>
                        <div style={{ fontSize: '9px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Wind</div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #1a1510', paddingTop: '16px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#4a4540' }}>Flights from NYC</span>
                        <span style={{ fontWeight: 'bold', color: '#f0ebe0' }}>~${spot.flightPrice}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', color: '#4a4540' }}>5 day trip est.</span>
                        <span style={{ fontWeight: 'bold', color: '#f0ebe0', fontSize: '18px' }}>~${spot.tripCost}</span>
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
                        boxSizing: 'border-box' as const,
                      }}>
                        Book Flights
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SNOW */}
        {showSnow && filteredSnow.length > 0 && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.4, marginBottom: '8px' }}>
                {filteredSnow.length} ski destinations · ranked by live score
              </div>
              <h2 style={{ fontSize: '40px', fontWeight: 'bold', margin: 0, letterSpacing: '-1px' }}>
                Snow Strikes
              </h2>
            </div>

            <div className="strikes-grid">
              {filteredSnow.map((resort, i) => (
                <div key={resort.slug} style={{
                  background: '#111010',
                  borderTop: i === 0 ? '2px solid #f0ebe0' : '1px solid #1a1510',
                  overflow: 'hidden',
                }}>
                  <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={SNOW_IMAGES[i % SNOW_IMAGES.length]}
                      alt={resort.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55) contrast(1.1)' }}
                    />
                    <div style={{
                      position: 'absolute', top: '12px', left: '12px',
                      background: resort.rating.bg, color: resort.rating.color,
                      fontSize: '10px', letterSpacing: '2px', padding: '3px 10px', fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                    }}>
                      {resort.rating.label}
                    </div>
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      background: 'rgba(10,8,8,0.7)', color: '#f0ebe0',
                      fontSize: '10px', letterSpacing: '1px', padding: '3px 8px',
                    }}>
                      #{i + 1} · {resort.score}/100
                    </div>
                    {resort.bestMonths.includes(currentMonth) && (
                      <div style={{
                        position: 'absolute', bottom: '12px', left: '12px',
                        fontSize: '9px', color: '#4ade80', letterSpacing: '1px',
                      }}>
                        IN SEASON
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '24px' }}>
                    <a href={`/spot/${resort.slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f0ebe0', marginBottom: '2px' }}>{resort.name}</div>
                    </a>
                    <div style={{ fontSize: '12px', color: '#4a4540', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>{resort.location}</div>
                    <div style={{ fontSize: '13px', color: '#6b6560', marginBottom: '20px', lineHeight: 1.5 }}>{resort.description}</div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                      <div style={{ background: '#0a0808', padding: '12px', textAlign: 'center' as const }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f0ebe0' }}>
                          {resort.totalSnowIn}<span style={{ fontSize: '13px' }}>"</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#4a4540', marginTop: '2px' }}>{resort.totalSnowCm}cm</div>
                        <div style={{ fontSize: '9px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>7 day snow</div>
                      </div>
                      <div style={{ background: '#0a0808', padding: '12px', textAlign: 'center' as const }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f0ebe0' }}>~${resort.hotelPrice}</div>
                        <div style={{ fontSize: '9px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Hotel/night</div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #1a1510', paddingTop: '16px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#4a4540' }}>Flights from NYC</span>
                        <span style={{ fontWeight: 'bold', color: '#f0ebe0' }}>~${resort.flightPrice}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', color: '#4a4540' }}>5 day trip est.</span>
                        <span style={{ fontWeight: 'bold', color: '#f0ebe0', fontSize: '18px' }}>~${resort.tripCost}</span>
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
                        boxSizing: 'border-box' as const,
                      }}>
                        Book Flights
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NO RESULTS */}
        {filteredSurf.length === 0 && filteredSnow.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: '80px', color: '#4a4540' }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>No spots found</div>
            <div style={{ fontSize: '14px' }}>Try a different region or search term</div>
          </div>
        )}

      </div>
    </div>
  );
}
