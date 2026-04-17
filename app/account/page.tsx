'use client';
import { useState } from 'react';
import MobileNav from '../components/MobileNav';

type Preferences = {
  type: 'surf' | 'ski' | 'both';
  skill: string;
  homeAirport: string;
  favoriteRegions: string[];
};

export default function AccountPage() {
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState<Preferences>({
    type: 'both',
    skill: '',
    homeAirport: '',
    favoriteRegions: [],
  });

  const regions = ['Americas', 'Europe', 'Asia Pacific', 'Indonesia', 'Africa'];

  function toggleRegion(region: string) {
    setPrefs(p => ({
      ...p,
      favoriteRegions: p.favoriteRegions.includes(region)
        ? p.favoriteRegions.filter(r => r !== region)
        : [...p.favoriteRegions, region],
    }));
  }

  function handleSave() {
    localStorage.setItem('strikemission_prefs', JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const btnStyle = (active: boolean) => ({
    padding: '12px 20px', fontSize: '12px', fontFamily: 'Georgia, serif',
    letterSpacing: '2px', textTransform: 'uppercase' as const, cursor: 'pointer',
    background: active ? '#f0ebe0' : '#111010',
    color: active ? '#0a0808' : '#6b6560',
    border: active ? 'none' : '1px solid #2a2520',
    fontWeight: active ? 'bold' as const : 'normal' as const,
  });

  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#0a0808', minHeight: '100vh', color: '#f0ebe0' }}>

      <nav style={{
        padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #1a1510', position: 'sticky', top: 0,
        background: 'rgba(10,8,8,0.97)', zIndex: 100,
      }}>
        <a href="/" style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase', color: '#f0ebe0', textDecoration: 'none' }}>
          Strike Mission
        </a>
        <MobileNav />
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 40px' }}>

        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.5, marginBottom: '12px' }}>Your Profile</div>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 12px', letterSpacing: '-2px' }}>Account</h1>
          <p style={{ color: '#6b6560', fontSize: '16px' }}>Set your preferences to personalize your Strike Mission experience.</p>
        </div>

        {/* WHAT ARE YOU CHASING */}
        <div style={{ background: '#111010', borderTop: '2px solid #f0ebe0', padding: '32px', marginBottom: '2px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.5, marginBottom: '16px' }}>What are you chasing?</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
            {(['surf', 'ski', 'both'] as const).map(t => (
              <button key={t} onClick={() => setPrefs(p => ({ ...p, type: t }))} style={btnStyle(prefs.type === t)}>
                {t === 'surf' ? 'Waves' : t === 'ski' ? 'Snow' : 'Both'}
              </button>
            ))}
          </div>
        </div>

        {/* SKILL LEVEL */}
        <div style={{ background: '#111010', padding: '32px', marginBottom: '2px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.5, marginBottom: '16px' }}>Skill level</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
            {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(s => (
              <button key={s} onClick={() => setPrefs(p => ({ ...p, skill: s }))} style={btnStyle(prefs.skill === s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* HOME AIRPORT */}
        <div style={{ background: '#111010', padding: '32px', marginBottom: '2px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.5, marginBottom: '16px' }}>Home airport</div>
          <input
            type="text"
            value={prefs.homeAirport}
            onChange={e => setPrefs(p => ({ ...p, homeAirport: e.target.value.toUpperCase() }))}
            placeholder="e.g. JFK, LAX, LHR"
            maxLength={3}
            style={{
              padding: '14px 20px', background: '#0a0808', border: '1px solid #2a2520',
              color: '#f0ebe0', fontSize: '18px', fontFamily: 'Georgia, serif',
              letterSpacing: '4px', width: '160px', outline: 'none',
            }}
          />
          <p style={{ color: '#4a4540', fontSize: '13px', marginTop: '8px' }}>Used to calculate flight prices from your location</p>
        </div>

        {/* FAVORITE REGIONS */}
        <div style={{ background: '#111010', padding: '32px', marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.5, marginBottom: '16px' }}>Favourite regions</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
            {regions.map(r => (
              <button key={r} onClick={() => toggleRegion(r)} style={btnStyle(prefs.favoriteRegions.includes(r))}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* SAVE */}
        <button
          onClick={handleSave}
          style={{
            width: '100%', padding: '18px', background: '#f0ebe0',
            color: '#0a0808', border: 'none', fontSize: '13px', fontWeight: 'bold',
            letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer',
            fontFamily: 'Georgia, serif', marginBottom: '24px',
          }}
        >
          {saved ? 'Saved! ✓' : 'Save Preferences →'}
        </button>

        {/* PREMIUM UPSELL */}
        <div style={{ background: '#111010', borderTop: '1px solid #1a1510', padding: '32px', textAlign: 'center' as const }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.5, marginBottom: '12px' }}>Premium — Coming Soon</div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 12px', letterSpacing: '-1px' }}>Unlock the full experience</h3>
          <p style={{ color: '#6b6560', marginBottom: '24px', fontSize: '14px', lineHeight: 1.7 }}>
            16-day forecasts, personal alerts when your favourite spots fire, one-click trip booking, and unlimited trip guides.
          </p>
          <div style={{ padding: '14px 32px', background: '#1a1510', color: '#4a4540', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', display: 'inline-block' }}>
            Join Waitlist — Coming Soon
          </div>
        </div>

      </div>
    </main>
  );
}
