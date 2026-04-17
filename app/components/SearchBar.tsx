'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type SpotOption = {
  slug: string;
  name: string;
  location: string;
  country: string;
  type: string;
  region: string;
};

const REGION_MAP: Record<string, string> = {
  'USA': 'Americas',
  'Canada': 'Americas',
  'Mexico': 'Americas',
  'Nicaragua': 'Americas',
  'Costa Rica': 'Americas',
  'Peru': 'Americas',
  'Chile': 'Americas',
  'Brazil': 'Americas',
  'France': 'Europe',
  'Spain': 'Europe',
  'Portugal': 'Europe',
  'Switzerland': 'Europe',
  'Austria': 'Europe',
  'Italy': 'Europe',
  'Ireland': 'Europe',
  'Norway': 'Europe',
  'Morocco': 'Africa',
  'Namibia': 'Africa',
  'South Africa': 'Africa',
  'Indonesia': 'Asia Pacific',
  'Japan': 'Asia Pacific',
  'Australia': 'Asia Pacific',
  'New Zealand': 'Asia Pacific',
  'Fiji': 'Asia Pacific',
  'French Polynesia': 'Asia Pacific',
  'Philippines': 'Asia Pacific',
  'Sri Lanka': 'Asia Pacific',
  'Maldives': 'Asia Pacific',
};

const REGION_ALIASES: Record<string, string[]> = {
  'Americas': ['usa', 'america', 'united states', 'canada', 'mexico', 'costa rica', 'nicaragua', 'peru', 'chile', 'alaska', 'hawaii', 'california', 'colorado', 'utah', 'wyoming', 'montana', 'idaho'],
  'Europe': ['europe', 'france', 'spain', 'portugal', 'switzerland', 'austria', 'italy', 'ireland', 'uk', 'england', 'norway', 'alps', 'basque'],
  'Asia Pacific': ['asia', 'pacific', 'indonesia', 'bali', 'japan', 'australia', 'new zealand', 'fiji', 'tahiti', 'lombok', 'sumbawa', 'mentawai', 'hokkaido'],
  'Africa': ['africa', 'morocco', 'namibia', 'south africa'],
};

export default function SearchBar({
  placeholder = 'Search any surf or ski spot...',
  redirectTo = 'spot',
}: {
  placeholder?: string;
  redirectTo?: string;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpotOption[]>([]);
  const [allSpots, setAllSpots] = useState<SpotOption[]>([]);
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/spots')
      .then(r => r.json())
      .then(data => {
        const spots = (data.spots ?? []).map((s: any) => ({
          slug: s.slug,
          name: s.name,
          location: s.location,
          country: s.country,
          type: s.type,
          region: REGION_MAP[s.country] ?? 'Other',
        }));
        setAllSpots(spots);
      })
      .catch(() => {});
  }, []);

  function handleSearch(val: string) {
    setQuery(val);
    if (val.length < 1) { setResults([]); return; }
    const q = val.toLowerCase().trim();

    let regionMatch: string | null = null;
    for (const [region, aliases] of Object.entries(REGION_ALIASES)) {
      if (aliases.some(alias => alias.includes(q) || q.includes(alias))) {
        regionMatch = region;
        break;
      }
    }

    const filtered = allSpots.filter(s => {
      if (regionMatch) return s.region === regionMatch;
      return (
        s.name.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q) ||
        q.split(' ').some(word =>
          word.length > 2 && (
            s.name.toLowerCase().includes(word) ||
            s.location.toLowerCase().includes(word) ||
            s.country.toLowerCase().includes(word)
          )
        )
      );
    }).slice(0, 8);

    setResults(filtered);
  }

  function handleSelect(slug: string) {
    setQuery('');
    setResults([]);
    router.push(`/${redirectTo}/${slug}`);
  }

  const groupedResults = results.reduce((acc, spot) => {
    if (!acc[spot.region]) acc[spot.region] = [];
    acc[spot.region].push(spot);
    return acc;
  }, {} as Record<string, SpotOption[]>);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
      <div style={{ display: 'flex', alignItems: 'center', background: '#111010', border: '1px solid #2a2520' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginLeft: '16px', flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" stroke="#4a4540" strokeWidth="1.5"/>
          <path d="m21 21-4.35-4.35" stroke="#4a4540" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder={placeholder}
          style={{
            flex: 1, padding: '16px', background: 'transparent',
            border: 'none', color: '#f0ebe0', fontSize: '16px',
            fontFamily: 'Georgia, serif', outline: 'none',
          }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); }} style={{
            background: 'none', border: 'none', color: '#4a4540',
            cursor: 'pointer', padding: '16px', fontSize: '18px',
          }}>×</button>
        )}
      </div>

      {focused && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: '#111010', border: '1px solid #2a2520',
          borderTop: 'none', zIndex: 1000, maxHeight: '400px', overflowY: 'auto',
        }}>
          {Object.entries(groupedResults).map(([region, spots]) => (
            <div key={region}>
              <div style={{ padding: '8px 16px', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#4a4540', background: '#0a0808' }}>
                {region}
              </div>
              {spots.map(spot => (
                <div
                  key={spot.slug}
                  onMouseDown={() => handleSelect(spot.slug)}
                  style={{
                    padding: '12px 16px', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', borderBottom: '1px solid #1a1510',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1a1510')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div>
                    <div style={{ fontSize: '15px', color: '#f0ebe0', fontWeight: 'bold' }}>{spot.name}</div>
                    <div style={{ fontSize: '12px', color: '#4a4540', textTransform: 'uppercase', letterSpacing: '1px' }}>{spot.location}</div>
                  </div>
                  <div style={{
                    fontSize: '10px', letterSpacing: '2px', padding: '3px 8px',
                    background: '#1a1510', color: '#f0ebe0', border: '1px solid #2a2520',
                    textTransform: 'uppercase',
                  }}>
                    {spot.type}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {query.length > 1 && (
            <div
              onMouseDown={() => { router.push(`/guide?q=${encodeURIComponent(query)}`); setQuery(''); setResults([]); }}
              style={{ padding: '12px 16px', cursor: 'pointer', color: '#4a4540', fontSize: '13px', textAlign: 'center' as const, borderTop: '1px solid #1a1510' }}
            >
              See all results for "{query}" →
            </div>
          )}
        </div>
      )}

      {focused && query.length > 0 && results.length === 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: '#111010', border: '1px solid #2a2520',
          borderTop: 'none', zIndex: 1000, padding: '20px 16px',
          color: '#4a4540', fontSize: '14px', textAlign: 'center' as const,
        }}>
          No spots found for "{query}" — try a country or region name
        </div>
      )}
    </div>
  );
}
