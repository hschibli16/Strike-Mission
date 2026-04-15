'use client';
import { useState } from 'react';

type Result = {
  name: string;
  location: string;
  slug: string;
  score: number;
  reason: string;
  flightPrice: number;
  hotelPrice: number;
  flag: string;
  waveHeight?: string;
  totalSnowIn?: string;
  airportCode: string;
};

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const DURATIONS = ['Weekend (2-3 days)', 'Short trip (4-5 days)', 'Full week', 'Two weeks+'];
const BUDGETS = ['Budget ($500-1000)', 'Mid-range ($1000-2500)', 'Luxury ($2500+)'];

function getGoogleFlightsUrl(from: string, to: string) {
  const today = new Date();
  const friday = new Date(today);
  friday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));
  const sunday = new Date(friday);
  sunday.setDate(friday.getDate() + 9);
  const fmt = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '');
  return `https://www.google.com/flights/#search;f=${from};t=${to};d=${fmt(friday)};r=${fmt(sunday)};tt=r`;
}

export default function TripFinder({ spots }: { spots: any[] }) {
  const [step, setStep] = useState(0);
  const [type, setType] = useState<'surf' | 'ski' | 'both'>('both');
  const [skill, setSkill] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');
  const [homeAirport, setHomeAirport] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  const btnStyle = (active: boolean) => ({
    padding: '12px 20px',
    background: active ? '#f0ebe0' : '#111010',
    color: active ? '#0a0808' : '#6b6560',
    border: active ? 'none' : '1px solid #2a2520',
    fontSize: '13px',
    fontFamily: 'Georgia, serif',
    letterSpacing: '1px',
    cursor: 'pointer',
    borderRadius: '2px',
    fontWeight: active ? 'bold' : 'normal' as const,
  });

  function getRecommendations() {
    setLoading(true);
    const budgetMax = budget.includes('500') ? 1000 : budget.includes('1000') ? 2500 : 9999;
    const skillNum = SKILL_LEVELS.indexOf(skill);

    const BEGINNER_SURF = ['nicaragua', 'portugal-coast', 'hossegor', 'trestles'];
    const INTERMEDIATE_SURF = ['uluwatu', 'supertubes', 'cloudbreak', 'snapper-rocks', 'raglan', 'chicama'];
    const ADVANCED_SURF = ['pipeline', 'teahupo-o', 'mavericks', 'skeleton-bay', 'mundaka', 'g-land'];

    const filtered = spots.filter(spot => {
      if (type !== 'both' && spot.type !== type) return false;
      const tripCost = spot.flightPrice + spot.hotelPrice * 5;
      if (tripCost > budgetMax) return false;
      if (spot.type === 'surf') {
        if (skillNum === 0 && !BEGINNER_SURF.includes(spot.slug)) return false;
        if (skillNum === 1 && ADVANCED_SURF.includes(spot.slug)) return false;
      }
      return true;
    });

    const scored = filtered.map(spot => {
      const tripCost = spot.flightPrice + spot.hotelPrice * 5;
      const conditionsScore = spot.type === 'surf'
        ? parseFloat(spot.swell?.waveHeightFt ?? '0') * 10
        : parseFloat(spot.totalSnowIn ?? '0') * 5;
      const valueScore = (1 - tripCost / 3000) * 20;
      const seasonScore = spot.bestMonths?.includes(new Date().getMonth() + 1) ? 15 : 0;
      const total = conditionsScore + valueScore + seasonScore;

      const reason = spot.type === 'surf'
        ? `${spot.swell?.waveHeightFt ?? 'N/A'}ft waves, ${spot.swell?.wavePeriod ?? 'N/A'}s period — ${spot.bestMonths?.includes(new Date().getMonth() + 1) ? 'perfect season' : 'good conditions'}`
        : `${spot.totalSnowIn ?? 'N/A'}" of snow forecast — ${spot.bestMonths?.includes(new Date().getMonth() + 1) ? 'peak season' : 'good conditions'}`;

      return {
        name: spot.name,
        location: spot.location,
        slug: spot.slug,
        score: total,
        reason,
        flightPrice: spot.flightPrice,
        hotelPrice: spot.hotelPrice,
        flag: spot.flag,
        waveHeight: spot.swell?.waveHeightFt,
        totalSnowIn: spot.totalSnowIn,
        airportCode: spot.airportCode,
      };
    });

    const top3 = scored.sort((a, b) => b.score - a.score).slice(0, 3);
    setResults(top3);
    setLoading(false);
    setStep(5);
  }

  const steps = [
    // Step 0 - Type
    <div key={0}>
      <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ebe0', marginBottom: '12px' }}>Step 1 of 4</div>
      <h3 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 24px', letterSpacing: '-1px' }}>What are you chasing?</h3>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
        {(['surf', 'ski', 'both'] as const).map(t => (
          <button key={t} onClick={() => { setType(t); setStep(1); }} style={btnStyle(type === t)}>
            {t === 'surf' ? 'Waves' : t === 'ski' ? 'Snow' : 'Both'}
          </button>
        ))}
      </div>
    </div>,

    // Step 1 - Skill
    <div key={1}>
      <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ebe0', marginBottom: '12px' }}>Step 2 of 4</div>
      <h3 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px', letterSpacing: '-1px' }}>Your skill level?</h3>
      <p style={{ color: '#6b6560', fontSize: '14px', marginBottom: '24px' }}>This helps us match you to the right spots</p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
        {SKILL_LEVELS.map(s => (
          <button key={s} onClick={() => { setSkill(s); setStep(2); }} style={btnStyle(skill === s)}>{s}</button>
        ))}
      </div>
    </div>,

    // Step 2 - Budget
    <div key={2}>
      <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ebe0', marginBottom: '12px' }}>Step 3 of 4</div>
      <h3 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px', letterSpacing: '-1px' }}>Trip budget?</h3>
      <p style={{ color: '#6b6560', fontSize: '14px', marginBottom: '24px' }}>Flights + accommodation estimate</p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
        {BUDGETS.map(b => (
          <button key={b} onClick={() => { setBudget(b); setStep(3); }} style={btnStyle(budget === b)}>{b}</button>
        ))}
      </div>
    </div>,

    // Step 3 - Home airport
    <div key={3}>
      <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ebe0', marginBottom: '12px' }}>Step 4 of 4</div>
      <h3 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px', letterSpacing: '-1px' }}>Where are you flying from?</h3>
      <p style={{ color: '#6b6560', fontSize: '14px', marginBottom: '24px' }}>Enter your nearest airport code</p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={homeAirport}
          onChange={e => setHomeAirport(e.target.value.toUpperCase())}
          placeholder="e.g. JFK, LAX, LHR"
          maxLength={3}
          style={{
            padding: '14px 20px', background: '#0a0808', border: '1px solid #2a2520',
            color: '#f0ebe0', fontSize: '18px', fontFamily: 'Georgia, serif',
            letterSpacing: '4px', width: '160px', outline: 'none',
          }}
        />
        <button
          onClick={() => { if (homeAirport.length >= 3) getRecommendations(); }}
          style={{ ...btnStyle(true), padding: '14px 28px' }}
        >
          Find My Strikes →
        </button>
      </div>
    </div>,
  ];

  return (
    <div style={{ background: '#111010', borderTop: '2px solid #f0ebe0', padding: '40px' }}>
      <div style={{ maxWidth: '700px' }}>

        {step < 5 && (
          <div>
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} style={{ background: 'none', border: 'none', color: '#4a4540', fontSize: '13px', cursor: 'pointer', marginBottom: '24px', fontFamily: 'Georgia, serif', padding: 0 }}>
                ← Back
              </button>
            )}
            {steps[step]}
          </div>
        )}

        {step === 5 && results.length > 0 && (
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ebe0', marginBottom: '8px' }}>Your personal strikes</div>
            <h3 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 24px', letterSpacing: '-1px' }}>Top 3 trips for you right now</h3>
            {results.map((r, i) => (
              <div key={r.slug} style={{ padding: '20px', background: '#0a0808', marginBottom: '8px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'center', borderTop: i === 0 ? '2px solid #f0ebe0' : '1px solid #1a1510' }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {i + 1}. {r.flag} {r.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#4a4540', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{r.location}</div>
                  <div style={{ fontSize: '13px', color: '#b0a898' }}>{r.reason}</div>
                  <div style={{ fontSize: '13px', color: '#6b6560', marginTop: '6px' }}>
                    Est. 5 day trip: <span style={{ color: '#f0ebe0', fontWeight: 'bold' }}>${r.flightPrice + r.hotelPrice * 5}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                  <a href={`/spot/${r.slug}`} style={{ padding: '10px 16px', background: '#f0ebe0', color: '#0a0808', textDecoration: 'none', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', textAlign: 'center' as const }}>
                    View Trip →
                  </a>
                  <a href={getGoogleFlightsUrl(homeAirport || 'JFK', r.airportCode)} target="_blank" rel="noopener noreferrer" style={{ padding: '10px 16px', background: 'transparent', color: '#f0ebe0', textDecoration: 'none', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', textAlign: 'center' as const, border: '1px solid #2a2520' }}>
                    Book Flights →
                  </a>
                </div>
              </div>
            ))}
            <button onClick={() => { setStep(0); setResults([]); }} style={{ marginTop: '16px', background: 'none', border: 'none', color: '#4a4540', fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia, serif', padding: 0 }}>
              ← Start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
