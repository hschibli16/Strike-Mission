import { notFound } from 'next/navigation';
import { getRegionBySlug, getSpotsInRegion, getAllRegions } from '../../lib/getSpots';
import NotifyWhenLiveForm from '../../components/NotifyWhenLiveForm';

export async function generateStaticParams() {
  const regions = await getAllRegions();
  return regions.map(r => ({ slug: r.slug }));
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatBestSeason(bestMonths: number[]): string {
  if (!bestMonths || bestMonths.length === 0) return '—';
  if (bestMonths.length === 12) return 'Year-round';

  const sorted = [...bestMonths].sort((a, b) => a - b);
  const set = new Set(sorted);
  const wrapsAround = set.has(12) && set.has(1);

  if (wrapsAround) {
    // Find start: first month in the Dec-side run
    let start = 12;
    while (set.has(start - 1) && start > 1) start--;
    if (!set.has(12)) start = sorted[0];

    // Find end: last consecutive month from start (wrapping)
    let end = start;
    let checking = start;
    while (set.has(checking)) {
      end = checking;
      checking = checking === 12 ? 1 : checking + 1;
      if (checking === start) break;
    }
    return `${MONTH_NAMES[start - 1]}–${MONTH_NAMES[end - 1]}`;
  }

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  return first === last ? MONTH_NAMES[first - 1] : `${MONTH_NAMES[first - 1]}–${MONTH_NAMES[last - 1]}`;
}

const CURRENT_MONTH = new Date().getMonth() + 1;

export default async function RegionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [region, spots] = await Promise.all([
    getRegionBySlug(slug),
    getSpotsInRegion(slug),
  ]);

  if (!region) return notFound();

  const isSurf = region.type === 'surf';

  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#0a0808', minHeight: '100vh', color: '#f0ebe0' }}>
      <style>{`
        .region-content { display: grid; grid-template-columns: 2fr 1fr; gap: 48px; padding: 0 60px 80px 60px; max-width: 1400px; margin: 0 auto; }
        .region-spots-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; margin-top: 20px; }
        .region-best-months { display: grid; grid-template-columns: repeat(12, 1fr); gap: 4px; margin: 16px 0 8px 0; }
        .region-sticky-col { position: sticky; top: 100px; align-self: start; }
        @media (max-width: 960px) {
          .region-content { grid-template-columns: 1fr; padding: 0 24px 60px 24px; }
          .region-spots-grid { grid-template-columns: repeat(2, 1fr); }
          .region-sticky-col { position: static; }
        }
        @media (max-width: 600px) {
          .region-spots-grid { grid-template-columns: 1fr; }
          .region-hero-h1 { font-size: 42px !important; }
          .region-hero-wrap { padding: 0 20px 48px 20px !important; }
        }
      `}</style>

      {/* HERO */}
      <div className="region-hero-wrap" style={{ padding: '48px 60px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Back link */}
        <div style={{ marginBottom: '32px' }}>
          <a href="/" style={{ fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.5, textDecoration: 'none' }}>
            ← Strike Mission
          </a>
        </div>

        {/* Eyebrow */}
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6560', marginBottom: '12px' }}>
          {isSurf ? 'Surf Region' : 'Ski Region'}
        </div>

        {/* h1 */}
        <h1 className="region-hero-h1" style={{ fontFamily: "'Georgia', serif", fontSize: '64px', color: '#f0ebe0', margin: '0', fontWeight: 'normal', lineHeight: 1.05, letterSpacing: '-1px' }}>
          {region.name}
        </h1>

        {/* Countries */}
        <div style={{ fontSize: '14px', color: '#6b6560', margin: '12px 0 32px 0' }}>
          {region.countries.join(' · ')}
        </div>

        {/* Best months strip */}
        <div className="region-best-months">
          {Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const isBest = region.bestMonths.includes(month);
            const isNow = month === CURRENT_MONTH;
            return (
              <div key={month}>
                <div style={{ fontSize: '10px', color: '#4a4540', textAlign: 'center', marginBottom: '4px', letterSpacing: '0.5px' }}>
                  {MONTH_NAMES[i].toUpperCase()}
                </div>
                <div style={{
                  height: isBest ? '8px' : '4px',
                  background: isBest ? '#4ade80' : '#1a1510',
                  borderRadius: '2px',
                }} />
                {isNow && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#fbbf24' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: '11px', color: '#4a4540', marginTop: '8px' }}>
          Best months highlighted · Current: {MONTH_NAMES[CURRENT_MONTH - 1]}
        </div>
      </div>

      {/* CONTENT */}
      <div className="region-content">
        {/* LEFT COLUMN */}
        <div>
          {/* Description */}
          {region.longDescription ? (
            <p style={{ fontFamily: "'Georgia', serif", fontSize: '18px', lineHeight: 1.7, color: '#f0ebe0', maxWidth: '680px', margin: '0 0 48px 0' }}>
              {region.longDescription}
            </p>
          ) : (
            <p style={{ fontFamily: "'Georgia', serif", fontSize: '16px', fontStyle: 'italic', color: '#6b6560', maxWidth: '680px', margin: '0 0 48px 0', lineHeight: 1.7 }}>
              We&apos;re still writing up the full regional guide for {region.name}. In the meantime, explore the spots below or drop your email to hear when new content drops.
            </p>
          )}

          {/* Spots section */}
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6560', marginBottom: '4px' }}>
              Spots in this region
            </div>
            <div style={{ height: '1px', background: '#1a1510', marginBottom: '20px' }} />

            {spots.length === 0 ? (
              <div style={{ border: '1px solid #1a1510', padding: '40px', textAlign: 'center' }}>
                <p style={{ fontStyle: 'italic', color: '#6b6560', fontSize: '15px', marginBottom: '24px' }}>
                  We haven&apos;t added any spots in this region yet. Drop your email and we&apos;ll notify you when we do.
                </p>
                <NotifyWhenLiveForm spotName={region.name} />
              </div>
            ) : (
              <div className="region-spots-grid">
                {spots.map(spot => (
                  <a
                    key={spot.slug}
                    href={`/spot/${spot.slug}`}
                    style={{ display: 'block', border: '1px solid #1a1510', padding: '16px', textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{ fontFamily: "'Georgia', serif", fontSize: '18px', color: '#f0ebe0', marginBottom: '4px' }}>
                      {spot.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                      {spot.location}
                    </div>
                    <div style={{
                      fontSize: '13px', fontStyle: 'italic', color: '#6b6560',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {spot.tagline}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="region-sticky-col">
          {/* At a glance */}
          <div style={{ border: '1px solid #1a1510', padding: '24px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6560', marginBottom: '16px' }}>
              At a glance
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#6b6560' }}>Countries</span>
                <span style={{ color: '#f0ebe0' }}>{region.countries.length}</span>
              </div>
              <div style={{ height: '1px', background: '#1a1510' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#6b6560' }}>Spots</span>
                <span style={{ color: '#f0ebe0' }}>{spots.length > 0 ? spots.length : '—'}</span>
              </div>
              <div style={{ height: '1px', background: '#1a1510' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#6b6560' }}>Best season</span>
                <span style={{ color: '#f0ebe0' }}>
                  {formatBestSeason(region.bestMonths)}
                </span>
              </div>
              {region.seasonNote && (
                <>
                  <div style={{ height: '1px', background: '#1a1510' }} />
                  <div style={{ fontSize: '12px', color: '#6b6560', fontStyle: 'italic', lineHeight: 1.5 }}>
                    {region.seasonNote}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Map placeholder */}
          <div style={{
            border: '1px solid #1a1510', height: '300px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '13px', fontStyle: 'italic', color: '#6b6560' }}>
              Interactive map coming soon
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
