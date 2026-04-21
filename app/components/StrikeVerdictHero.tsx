'use client';

export type BestWindow = {
  dayIndex: number;
  label: string;
  date: string;
  height: string;
  period: string;
  condLabel: string;
};

type Props = {
  spotName: string;
  location: string;
  flag: string;
  tagline?: string;
  verdict: string;
  summary: string;
  isBookable: boolean;
};

function verdictColor(label: string): string {
  if (label === 'FIRING' || label === 'POWDER DAY') return '#4ade80';
  if (label === 'GOOD' || label === 'GOOD SNOW') return '#86efac';
  if (label === 'FAIR' || label === 'SKIABLE') return '#fbbf24';
  if (label === 'BLOWN OUT' || label === 'ICY') return '#6b6560';
  return '#4a4540';
}

export default function StrikeVerdictHero({
  spotName,
  location,
  flag,
  tagline,
  verdict,
  summary,
  isBookable,
}: Props) {
  const color = verdictColor(verdict);

  return (
    <div style={{ padding: '40px 60px 48px', background: '#0a0808' }}>
      <style>{`
        @media (max-width: 900px) {
          .verdict-label { font-size: 48px !important; }
          .verdict-cta-row { flex-direction: column !important; }
          .verdict-cta-row button { width: 100% !important; }
        }
      `}</style>

      <div style={{ fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', color: '#6b6560', marginBottom: '12px' }}>
        {flag} {location.toUpperCase()}
      </div>
      <h1 style={{ fontFamily: "'Georgia', serif", fontSize: '48px', fontWeight: 'bold', color: '#f0ebe0', margin: '0 0 8px 0', letterSpacing: '-1px', lineHeight: 1.1 }}>
        {spotName}
      </h1>
      {tagline && (
        <div style={{ fontFamily: "'Georgia', serif", fontSize: '16px', fontStyle: 'italic', color: '#6b6560', margin: '8px 0 16px' }}>
          {tagline}
        </div>
      )}
      <div className="verdict-label" style={{
        fontSize: '72px', fontFamily: "'Georgia', serif", letterSpacing: '-2px',
        lineHeight: 1, color, marginBottom: '20px', marginTop: tagline ? '0' : '16px',
      }}>
        {verdict}
      </div>
      {/* CTA buttons */}
      <div className="verdict-cta-row" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={() => console.log('Book this week')}
          disabled={!isBookable}
          style={{
            display: 'inline-block',
            padding: '14px 32px', fontFamily: "'Georgia', serif", fontSize: '14px',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            background: '#f0ebe0', color: '#0a0808', border: 'none',
            cursor: !isBookable ? 'not-allowed' : 'pointer',
            opacity: !isBookable ? 0.4 : 1,
          }}
        >
          Book this week
        </button>
        <button
          onClick={() => console.log('Set strike alert')}
          style={{
            display: 'inline-block',
            padding: '14px 32px', fontFamily: "'Georgia', serif", fontSize: '14px',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            background: 'transparent', color: '#f0ebe0', border: '1px solid #2a2520', cursor: 'pointer',
          }}
        >
          Set strike alert
        </button>
      </div>
    </div>
  );
}
