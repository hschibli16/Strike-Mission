'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { Spot } from '../spots';

const WorldMap = dynamic(() => import('./WorldMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6b6560',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    }}>
      Loading map…
    </div>
  ),
});

interface RegionData {
  slug: string;
  name: string;
  type: 'surf' | 'ski';
  countries: string[];
  centroidLat?: number;
  centroidLon?: number;
  focusZoom?: number;
}

interface Props {
  regions: RegionData[];
  spotCountByRegion: Record<string, number>;
  firingSpots: Spot[];
  allSpots: Spot[];
}

type Mode = 'all' | 'surf' | 'ski';
type View = 'grid' | 'map';

const CURRENT_MONTH = new Date().getMonth() + 1;

const BTN_BASE: React.CSSProperties = {
  padding: '10px 20px',
  fontFamily: "'Georgia', serif",
  fontSize: '13px',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  cursor: 'pointer',
  border: '1px solid #2a2520',
  background: 'transparent',
  color: '#f0ebe0',
};

const BTN_ACTIVE: React.CSSProperties = {
  ...BTN_BASE,
  background: '#f0ebe0',
  color: '#0a0808',
};

function firingTag(spot: Spot): { text: string; color: string } {
  const inSeason = spot.bestMonths.includes(CURRENT_MONTH);
  const hasBuoy = !!spot.buoyId;
  if (inSeason && hasBuoy) return { text: 'In season · Tracked', color: '#4ade80' };
  if (inSeason) return { text: 'In season', color: '#fbbf24' };
  return { text: 'Off-season', color: '#6b6560' };
}

export default function GuideExplorer({ regions, spotCountByRegion, firingSpots, allSpots }: Props) {
  const [mode, setMode] = useState<Mode>('all');
  const [view, setView] = useState<View>('grid');

  const filteredRegions = regions
    .filter(r => mode === 'all' || r.type === mode)
    .sort((a, b) => a.name.localeCompare(b.name));

  const subtitle =
    mode === 'surf' ? '24 surf regions' :
    mode === 'ski'  ? '21 ski regions' :
    'All 45 regions worldwide';

  const showFiringStrip = view === 'grid' && (mode === 'all' || mode === 'surf') && firingSpots.length > 0;

  const regionNameBySlug: Record<string, string> = {};
  regions.forEach(r => { regionNameBySlug[r.slug] = r.name; });

  return (
    <div>
      <style>{`
        .region-card { border: 1px solid #1a1510; padding: 24px; background: transparent; text-decoration: none; display: block; color: inherit; transition: border-color 0.15s; }
        .region-card:hover { border-color: #2a2520; }
        .firing-card { border: 1px solid #1a1510; padding: 20px; min-width: 220px; flex-shrink: 0; text-decoration: none; display: block; color: inherit; transition: border-color 0.15s; }
        .firing-card:hover { border-color: #2a2520; }
        .firing-strip { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; }
        .firing-strip::-webkit-scrollbar { height: 4px; }
        .firing-strip::-webkit-scrollbar-thumb { background: #1a1510; border-radius: 2px; }
        .guide-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 0 60px 80px 60px; }
        @media (max-width: 1100px) { .guide-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px)  { .guide-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px)  { .guide-grid { grid-template-columns: 1fr; padding: 0 20px 60px 20px; } }
        @media (max-width: 600px)  { .guide-toggles { padding: 24px 20px 12px 20px !important; } .guide-eyebrow { padding: 0 20px !important; } .guide-firing { padding: 0 20px 40px 20px !important; } }
      `}</style>

      {/* TOGGLE ROW */}
      <div
        className="guide-toggles"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '32px 60px 16px 60px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['all', 'surf', 'ski'] as Mode[]).map(m => (
            <button key={m} style={mode === m ? BTN_ACTIVE : BTN_BASE} onClick={() => setMode(m)}>
              {m === 'all' ? 'All' : m === 'surf' ? 'Surf' : 'Ski'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['grid', 'map'] as View[]).map(v => (
            <button key={v} style={view === v ? BTN_ACTIVE : BTN_BASE} onClick={() => setView(v)}>
              {v === 'grid' ? 'Grid' : 'Map'}
            </button>
          ))}
        </div>
      </div>

      {view === 'grid' ? (
        <>
          {/* CURRENTLY FIRING STRIP */}
          {showFiringStrip && (
            <div className="guide-firing" style={{ padding: '0 60px 48px 60px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6560' }}>
                Currently firing
              </div>
              <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#6b6560', margin: '4px 0 16px 0' }}>
                Best surf conditions across our tracked spots right now
              </div>
              <div className="firing-strip">
                {firingSpots.map(spot => {
                  const tag = firingTag(spot);
                  const regionName = regionNameBySlug[spot.regionSlug] ?? spot.location;
                  return (
                    <Link key={spot.slug} href={`/spot/${spot.slug}`} className="firing-card">
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b6560', margin: '0 0 8px 0' }}>
                        {regionName}
                      </div>
                      <div style={{ fontFamily: "'Georgia', serif", fontSize: '20px', color: '#f0ebe0', margin: '0' }}>
                        {spot.name}
                      </div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b6560', margin: '4px 0 12px 0' }}>
                        {spot.location}
                      </div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold', color: tag.color }}>
                        {tag.text}
                      </div>
                      {spot.tagline && (
                        <div style={{
                          fontSize: '12px', fontStyle: 'italic', color: '#6b6560', marginTop: '8px',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {spot.tagline}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* EXPLORE BY REGION header */}
          <div className="guide-eyebrow" style={{ padding: '0 60px', marginBottom: '32px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6560', margin: '0 0 8px 0' }}>
              Explore by region
            </div>
            <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#6b6560', margin: '0' }}>
              {subtitle}
            </div>
          </div>

          {/* REGION GRID */}
          <div className="guide-grid">
            {filteredRegions.map(region => {
              const count = spotCountByRegion[region.slug] ?? 0;
              const isEmpty = count === 0;
              return (
                <Link
                  key={region.slug}
                  href={`/region/${region.slug}`}
                  className="region-card"
                  style={{ opacity: isEmpty ? 0.5 : 1 }}
                >
                  <div style={{ fontFamily: "'Georgia', serif", fontSize: '20px', color: '#f0ebe0', margin: '0 0 8px 0' }}>
                    {region.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b6560' }}>
                    {region.countries.slice(0, 3).join(' · ')}
                    {region.countries.length > 3 ? ` +${region.countries.length - 3} more` : ''}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
                    {isEmpty ? (
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6560' }}>
                        Coming soon
                      </div>
                    ) : (
                      <>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b6560' }}>
                          {count} spot{count !== 1 ? 's' : ''}
                        </div>
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ padding: '32px 60px 80px 60px' }}>
          <WorldMap
            regions={regions as any}
            spots={allSpots}
            spotCountByRegion={spotCountByRegion}
            mode={mode}
          />
        </div>
      )}
    </div>
  );
}
