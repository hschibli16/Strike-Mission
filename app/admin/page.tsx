'use client';
import { useState } from 'react';

export default function AdminPage() {
  const [spotName, setSpotName] = useState('');
  const [type, setType] = useState<'surf' | 'ski'>('surf');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState<any>(null);

  async function generateSpot() {
    if (!spotName) return;
    setLoading(true);
    setError('');
    setResult('');
    setGenerated(null);

    try {
      const res = await fetch('/api/generate-spot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotName, type }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setGenerated(data.spot);
        setResult(JSON.stringify(data.spot, null, 2));
      }
    } catch {
      setError('Failed to generate spot');
    }
    setLoading(false);
  }

  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#0a0808', minHeight: '100vh', color: '#f0ebe0', padding: '40px' }}>
      <a href="/" style={{ color: '#4a4540', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase' }}>← Back to site</a>
      
      <h1 style={{ fontSize: '42px', fontWeight: 'bold', margin: '24px 0 8px', letterSpacing: '-2px' }}>Spot Generator</h1>
      <p style={{ color: '#6b6560', marginBottom: '40px' }}>AI-powered spot data generator. Generate complete spot profiles to add to the database.</p>

      <div style={{ background: '#111010', borderTop: '2px solid #e8823a', padding: '32px', marginBottom: '32px', maxWidth: '600px' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '8px' }}>Spot Name</div>
          <input
            type="text"
            value={spotName}
            onChange={e => setSpotName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generateSpot()}
            placeholder="e.g. Bells Beach, Biarritz, Zell am See"
            style={{
              width: '100%', padding: '14px 16px', background: '#0a0808',
              border: '1px solid #2a2520', color: '#f0ebe0', fontSize: '16px',
              fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box' as const,
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '8px' }}>Type</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['surf', 'ski'] as const).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  padding: '10px 24px', fontSize: '13px', fontFamily: 'Georgia, serif',
                  letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer',
                  background: type === t ? '#e8823a' : '#0a0808',
                  color: type === t ? '#0a0808' : '#6b6560',
                  border: type === t ? 'none' : '1px solid #2a2520',
                  fontWeight: type === t ? 'bold' : 'normal',
                }}
              >
                {t === 'surf' ? 'Surf' : 'Ski'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generateSpot}
          disabled={loading || !spotName}
          style={{
            width: '100%', padding: '16px', background: loading ? '#4a4540' : '#e8823a',
            color: '#0a0808', border: 'none', fontSize: '13px', fontWeight: 'bold',
            letterSpacing: '2px', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Georgia, serif',
          }}
        >
          {loading ? 'Generating...' : 'Generate Spot →'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#1a0808', border: '1px solid #e83a3a', padding: '16px', marginBottom: '24px', color: '#e83a3a', maxWidth: '600px' }}>
          Error: {error}
        </div>
      )}

      {generated && (
        <div style={{ maxWidth: '800px' }}>
          <div style={{ background: '#111010', borderTop: '2px solid #00aa44', padding: '24px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#00aa44', marginBottom: '12px' }}>Generated Successfully</div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 4px' }}>{generated.name}</h2>
            <div style={{ color: '#6b6560', marginBottom: '16px' }}>{generated.location} · {generated.airportCode} · ${generated.flightPrice} flights · ${generated.hotelPrice}/night</div>
            <p style={{ color: '#b0a898', lineHeight: 1.7, marginBottom: '16px' }}>{generated.description}</p>
            <div style={{ fontSize: '13px', color: '#4a4540', marginBottom: '8px' }}>Best months: {generated.bestMonths?.join(', ')}</div>
            <div style={{ fontSize: '13px', color: '#4a4540' }}>Ideal conditions: {generated.idealConditions}</div>
          </div>

          <div style={{ background: '#111010', padding: '24px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '12px' }}>Copy this into spots.ts</div>
            <pre style={{
              background: '#0a0808', padding: '20px', overflowX: 'auto' as const,
              fontSize: '12px', color: '#b0a898', lineHeight: 1.6,
              border: '1px solid #1a1510', whiteSpace: 'pre-wrap' as const,
            }}>
              {result}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              style={{
                marginTop: '12px', padding: '10px 20px', background: '#e8823a',
                color: '#0a0808', border: 'none', fontSize: '12px', fontWeight: 'bold',
                letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer',
                fontFamily: 'Georgia, serif',
              }}
            >
              Copy JSON →
            </button>
          </div>

          <div style={{ background: '#111010', padding: '24px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '12px' }}>How to add to the site</div>
            <div style={{ fontSize: '14px', color: '#b0a898', lineHeight: 1.8 }}>
              1. Copy the JSON above<br/>
              2. Open app/spots.ts<br/>
              3. Find the line: export const SURF_SPOTS...<br/>
              4. Paste the spot object into ALL_SPOTS before that line<br/>
              5. Save and the spot appears automatically on the site
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
