'use client';
import { useState } from 'react';
import { SurferIcon, SkierIcon, FlagIcon } from '../components/Icons';

type Spot = {
  name: string;
  location: string;
  country: string;
  flag: string;
  description: string;
  airportCode: string;
  slug: string;
  swell?: {
    waveHeight: string | null;
    waveHeightFt: string | null;
    wavePeriod: string | null;
    windSpeed: string | null;
  } | null;
  rating: { label: string; color: string };
  tripCost: number;
  flightPrice: number;
  hotelPrice: number;
  type: 'surf' | 'ski';
  totalSnowIn?: string;
  totalSnowCm?: string;
};

const REGIONS: Record<string, string[]> = {
  'All': [],
  'Americas': ['USA', 'Canada', 'Mexico', 'Fiji'],
  'Europe': ['France', 'Portugal', 'Switzerland'],
  'Asia Pacific': ['Japan', 'Indonesia', 'Australia'],
  'Africa': ['South Africa'],
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
];

export default function StrikesClient({ surfSpots, snowSpots }: { surfSpots: Spot[]; snowSpots: Spot[] }) {
  const [activeRegion, setActiveRegion] = useState('All');
  const [activeType, setActiveType] = useState<'both' | 'surf' | 'ski'>('both');
  const [search, setSearch] = useState('');

  const filterSpots = (spots: Spot[]) => {
    return spots.filter(spot => {
      const matchesRegion = activeRegion === 'All' || REGIONS[activeRegion]?.includes(spot.country);

      if (search === '') return matchesRegion;

      const searchLower = search.toLowerCase();
      const searchable = [
        spot.name,
        spot.location,
        spot.country,
        spot.description,
      ].join(' ').toLowerCase();

      // Split search into words and check each one
      const words = searchLower.split(' ').filter(w => w.length > 0);
      const matchesSearch = words.every(word => searchable.includes(word));

      return matchesRegion && matchesSearch;
    });
  };

  const filteredSurf = filterSpots(surfSpots);
  const filteredSnow = filterSpots(snowSpots);
  const showSurf = activeType === 'both' || activeType === 'surf';
  const showSnow = activeType === 'both' || activeType === 'ski';

  const btnBase = {
    padding: '10px 20px', fontSize: '12px', letterSpacing: '2px',
    textTransform: 'uppercase' as const, border: 'none', cursor: 'pointer',
    fontFamily: 'Georgia, serif', fontWeight: 'bold' as const,
  };

  return (
    <div style={{ padding: '40px 60px' }}>

      {/* SEARCH + FILTERS */}
      <div style={{ marginBottom: '40px' }}>

        {/* Search */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search spots, locations, countries..."
            style={{
              width: '100%', padding: '16px 20px', background: '#111010',
              border: '1px solid #2a2520', color: '#f0ebe0', fontSize: '16px',
              outline: 'none', fontFamily: 'Georgia, serif',
              boxSizing: 'border-box' as const
            }}
          />
        </div>

        {/* Type Filter */}
        <div style={{ display: 'flex', gap: '2px', marginBottom: '12px' }}>
          {(['both', 'surf', 'ski'] as const).map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              style={{
                ...btnBase,
                background: activeType === type ? '#e8823a' : '#111010',
                color: activeType === type ? '#0a0808' : '#6b6560',
              }}
            >
              {type === 'both' ? '⚡ All' : type === 'surf' ? '🏄 Surf' : '🎿 Snow'}
            </button>
          ))}
        </div>

        {/* Region Filter */}
        <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' as const }}>
          {Object.keys(REGIONS).map(region => (
            <button
              key={region}
              onClick={() => setActiveRegion(region)}
              style={{
                ...btnBase,
                background: activeRegion === region ? '#f0ebe0' : '#111010',
                color: activeRegion === region ? '#0a0808' : '#6b6560',
              }}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* SURF STRIKES */}
      {showSurf && filteredSurf.length > 0 && (
        <div style={{ marginBottom: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase' as const, color: '#e8823a', marginBottom: '8px' }}>This week</div>
              <h2 style={{ fontSize: '36px', fontWeight: 'bold', margin: 0, letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <SurferIcon size={36} color="#f0ebe0" /> Surf Strikes
              </h2>
            </div>
            <div style={{ fontSize: '13px', color: '#4a4540' }}>{filteredSurf.length} spots</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
            {filteredSurf.map((spot, i) => (
              <div key={spot.name} style={{
                background: '#111010',
                borderTop: i === 0 ? '2px solid #e8823a' : '2px solid #1a1510',
                overflow: 'hidden'
              }}>
                <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={SURF_IMAGES[i % SURF_IMAGES.length]}
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
                  <a href={`/spot/${spot.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f0ebe0', marginBottom: '2px' }}><FlagIcon country={spot.country} size={16} /> {spot.name}</div>
                  </a>
                  <div style={{ fontSize: '12px', color: '#4a4540', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '6px' }}>{spot.location}</div>
                  <div style={{ fontSize: '13px', color: '#6b6560', marginBottom: '16px' }}>{spot.description}</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ background: '#0a0808', padding: '12px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: i === 0 ? '#e8823a' : '#f0ebe0' }}>
                        {spot.swell?.waveHeightFt ?? 'N/A'}<span style={{ fontSize: '11px' }}>ft</span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#4a4540', marginTop: '2px' }}>{spot.swell?.waveHeight ?? '—'}m</div>
                      <div style={{ fontSize: '9px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase' as const, marginTop: '4px' }}>Height</div>
                    </div>
                    <div style={{ background: '#0a0808', padding: '12px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f0ebe0' }}>
                        {spot.swell?.wavePeriod ?? 'N/A'}<span style={{ fontSize: '11px' }}>s</span>
                      </div>
                      <div style={{ fontSize: '9px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase' as const, marginTop: '4px' }}>Period</div>
                    </div>
                    <div style={{ background: '#0a0808', padding: '12px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f0ebe0' }}>
                        {spot.swell?.windSpeed ?? 'N/A'}<span style={{ fontSize: '11px' }}>kt</span>
                      </div>
                      <div style={{ fontSize: '9px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase' as const, marginTop: '4px' }}>Wind</div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #1a1510', paddingTop: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#4a4540' }}>Flights from NYC</span>
                      <span style={{ fontWeight: 'bold' }}>~${spot.flightPrice}</span>
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
                    textTransform: 'uppercase' as const, textDecoration: 'none',
                    textAlign: 'center' as const, boxSizing: 'border-box' as const
                  }}>
                    Book This Strike →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SNOW STRIKES */}
      {showSnow && filteredSnow.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase' as const, color: '#e8823a', marginBottom: '8px' }}>This week</div>
              <h2 style={{ fontSize: '36px', fontWeight: 'bold', margin: 0, letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <SkierIcon size={36} color="#f0ebe0" /> Snow Strikes
              </h2>
            </div>
            <div style={{ fontSize: '13px', color: '#4a4540' }}>{filteredSnow.length} spots</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
            {filteredSnow.map((resort, i) => (
              <div key={resort.name} style={{
                background: '#111010',
                borderTop: i === 0 ? '2px solid #e8823a' : '2px solid #1a1510',
                overflow: 'hidden'
              }}>
                <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={SNOW_IMAGES[i % SNOW_IMAGES.length]}
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
                  <a href={`/spot/${resort.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f0ebe0', marginBottom: '2px' }}><FlagIcon country={resort.country} size={16} /> {resort.name}</div>
                  </a>
                  <div style={{ fontSize: '12px', color: '#4a4540', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '6px' }}>{resort.location}</div>
                  <div style={{ fontSize: '13px', color: '#6b6560', marginBottom: '16px' }}>{resort.description}</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ background: '#0a0808', padding: '12px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: i === 0 ? '#e8823a' : '#f0ebe0' }}>
                        {resort.totalSnowIn}<span style={{ fontSize: '13px' }}>&quot;</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#4a4540', marginTop: '2px' }}>{resort.totalSnowCm}cm</div>
                      <div style={{ fontSize: '9px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase' as const, marginTop: '4px' }}>7 day snow</div>
                    </div>
                    <div style={{ background: '#0a0808', padding: '12px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f0ebe0' }}>
                        ~${resort.hotelPrice}
                      </div>
                      <div style={{ fontSize: '9px', color: '#4a4540', letterSpacing: '1px', textTransform: 'uppercase' as const, marginTop: '4px' }}>Hotel/night</div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #1a1510', paddingTop: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#4a4540' }}>Flights from NYC</span>
                      <span style={{ fontWeight: 'bold' }}>~${resort.flightPrice}</span>
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
                    textTransform: 'uppercase' as const, textDecoration: 'none',
                    textAlign: 'center' as const, boxSizing: 'border-box' as const
                  }}>
                    Book This Strike →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NO RESULTS */}
      {filteredSurf.length === 0 && filteredSnow.length === 0 && (
        <div style={{ textAlign: 'center' as const, padding: '80px', color: '#4a4540' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌊</div>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>No spots found</div>
          <div style={{ fontSize: '14px' }}>Try a different region or search term</div>
        </div>
      )}

    </div>
  );
}
