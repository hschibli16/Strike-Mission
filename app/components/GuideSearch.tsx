'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Region } from '../regions';
import type { Spot } from '../spots';

interface Props {
  regions: Pick<Region, 'slug' | 'name' | 'type' | 'countries'>[];
  spots: Pick<Spot, 'slug' | 'name' | 'location' | 'country' | 'type'>[];
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(s: string) {
  // split on whitespace, hyphens, ampersands
  return s.toLowerCase().split(/[\s\-&]+/).filter(Boolean);
}

function scoreCandidate(queryFull: string, queryTokens: string[], nameFull: string, extraFields: string[]): number {
  let score = 0;
  const nameNorm = normalize(nameFull);
  const nameTokens = tokenize(nameFull);
  const allText = [nameNorm, ...extraFields.map(normalize)].join(' ');

  // +100 exact prefix on full name
  if (nameNorm.startsWith(queryFull)) score += 100;
  // +50 substring of full query in name
  else if (nameNorm.includes(queryFull)) score += 50;

  for (const qt of queryTokens) {
    // +30 per token that exactly matches a name token
    if (nameTokens.includes(qt)) score += 30;
    // +20 per token that matches a token in extra fields (countries/location/country)
    for (const field of extraFields) {
      if (tokenize(field).includes(qt)) { score += 20; break; }
    }
    // +10 per token that appears as substring anywhere
    if (allText.includes(qt)) score += 10;
  }

  return score;
}

export default function GuideSearch({ regions, spots }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q = normalize(query.trim());
  const qTokens = tokenize(query.trim());

  type RegionResult = { kind: 'region'; slug: string; name: string; country: string; score: number };
  type SpotResult   = { kind: 'spot';   slug: string; name: string; sub: string; score: number };
  type Result = RegionResult | SpotResult;

  let results: Result[] = [];
  if (q.length > 0) {
    const regionHits: RegionResult[] = regions
      .map(r => ({
        kind: 'region' as const,
        slug: r.slug,
        name: r.name,
        country: r.countries[0] ?? '',
        score: scoreCandidate(q, qTokens, r.name, r.countries),
      }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .slice(0, 6);

    const spotHits: SpotResult[] = spots
      .map(s => ({
        kind: 'spot' as const,
        slug: s.slug,
        name: s.name,
        sub: [s.location, s.country].filter(Boolean).join(' · '),
        score: scoreCandidate(q, qTokens, s.name, [s.location ?? '', s.country ?? '']),
      }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .slice(0, 6);

    results = [...regionHits, ...spotHits];
  }

  function handleFocus() {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setOpen(true);
  }

  function handleBlur() {
    blurTimer.current = setTimeout(() => setOpen(false), 200);
  }

  function navigate(href: string) {
    setOpen(false);
    setQuery('');
    router.push(href);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && results.length > 0) {
      const first = results[0];
      navigate(first.kind === 'region' ? `/region/${first.slug}` : `/spot/${first.slug}`);
    }
  }

  return (
    <div style={{ position: 'relative', maxWidth: '560px' }}>
      <style>{`
        .guide-search-result:hover { background: #1a1510; cursor: pointer; }
        .guide-search-result { padding: 12px 16px; border-bottom: 1px solid #1a1510; }
        .guide-search-result:last-child { border-bottom: none; }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2520', backdropFilter: 'blur(8px)' }}>
        <svg style={{ marginLeft: '16px', flexShrink: 0, opacity: 0.4 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKey}
          placeholder="Search any surf or ski spot worldwide..."
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#f0ebe0', fontSize: '15px', padding: '16px 16px',
            fontFamily: 'inherit',
          }}
        />
      </div>
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#0f0d0a', border: '1px solid #2a2520',
          maxHeight: '400px', overflowY: 'auto', zIndex: 100,
        }}>
          {results.map(r => (
            <div
              key={r.kind + r.slug}
              className="guide-search-result"
              onClick={() => navigate(r.kind === 'region' ? `/region/${r.slug}` : `/spot/${r.slug}`)}
            >
              <div style={{ fontSize: '10px', letterSpacing: '2px', color: '#6b6560', textTransform: 'uppercase', marginBottom: '2px' }}>
                {r.kind}
              </div>
              <div style={{ fontSize: '15px', fontFamily: 'Georgia, serif', color: '#f0ebe0' }}>{r.name}</div>
              <div style={{ fontSize: '12px', color: '#6b6560', marginTop: '1px' }}>
                {r.kind === 'region' ? r.country : r.sub}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
