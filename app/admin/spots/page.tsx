'use client';
import { useState, useEffect } from 'react';

type Spot = {
  id: string;
  slug: string;
  name: string;
  location: string;
  country: string;
  type: string;
  description: string;
  tagline: string;
  best_break: string;
  best_run: string;
  ideal_conditions: string;
  local_tips: string[];
  flight_price: number;
  hotel_price: number;
  best_months: number[];
  weekend_trip: any;
  week_trip: any;
};

export default function SpotsAdmin() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [selected, setSelected] = useState<Spot | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'surf' | 'ski'>('all');

  useEffect(() => {
    fetch('/api/spots')
      .then(r => r.json())
      .then(data => setSpots(data.spots ?? []));
  }, []);

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    const res = await fetch('/api/spots/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selected),
    });
    const data = await res.json();
    if (data.success) {
      setSaved(true);
      setSpots(spots.map(s => s.id === selected.id ? selected : s));
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  const filtered = spots.filter(s => {
    const matchesFilter = filter === 'all' || s.type === filter;
    const matchesSearch = search === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const inputStyle = {
    width: '100%', padding: '10px 12px', background: '#0a0808',
    border: '1px solid #2a2520', color: '#f0ebe0', fontSize: '14px',
    fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box' as const,
    marginBottom: '12px',
  };

  const labelStyle = {
    fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' as const,
    color: '#4a4540', marginBottom: '6px', display: 'block',
  };

  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#0a0808', minHeight: '100vh', color: '#f0ebe0', display: 'flex' }}>

      {/* SIDEBAR */}
      <div style={{ width: '320px', borderRight: '1px solid #1a1510', height: '100vh', overflow: 'auto', position: 'sticky', top: 0, flexShrink: 0 }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #1a1510' }}>
          <a href="/admin" style={{ color: '#4a4540', textDecoration: 'none', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>← Admin</a>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '12px 0 16px', letterSpacing: '-1px' }}>Spots Editor</h2>
          <input
            type="text"
            placeholder="Search spots..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, marginBottom: '8px' }}
          />
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['all', 'surf', 'ski'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '6px 12px', fontSize: '11px', letterSpacing: '1px',
                textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Georgia, serif',
                background: filter === f ? '#f0ebe0' : '#111010',
                color: filter === f ? '#0a0808' : '#4a4540',
                border: 'none',
              }}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div>
          {filtered.map(spot => (
            <div
              key={spot.id}
              onClick={() => setSelected({ ...spot })}
              style={{
                padding: '16px 20px', cursor: 'pointer', borderBottom: '1px solid #0f0f0f',
                background: selected?.id === spot.id ? '#1a1510' : 'transparent',
                borderLeft: selected?.id === spot.id ? '2px solid #f0ebe0' : '2px solid transparent',
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '2px' }}>{spot.name}</div>
              <div style={{ fontSize: '11px', color: '#4a4540', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {spot.location} · {spot.type}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EDITOR */}
      {selected ? (
        <div style={{ flex: 1, padding: '40px', overflow: 'auto', maxHeight: '100vh' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 4px', letterSpacing: '-1px' }}>{selected.name}</h1>
              <div style={{ fontSize: '13px', color: '#4a4540', textTransform: 'uppercase', letterSpacing: '2px' }}>{selected.location} · {selected.type}</div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '12px 28px', background: saved ? '#4ade80' : '#f0ebe0',
                color: '#0a0808', border: 'none', fontSize: '12px', fontWeight: 'bold',
                letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer',
                fontFamily: 'Georgia, serif',
              }}
            >
              {saving ? 'Saving...' : saved ? 'Saved! ✓' : 'Save Changes'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

            <div>
              <label style={labelStyle}>Tagline</label>
              <input style={inputStyle} value={selected.tagline ?? ''} onChange={e => setSelected({ ...selected, tagline: e.target.value })} />

              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, height: '120px', resize: 'vertical' as const }}
                value={selected.description ?? ''}
                onChange={e => setSelected({ ...selected, description: e.target.value })}
              />

              <label style={labelStyle}>{selected.type === 'surf' ? 'Best Break' : 'Best Run'}</label>
              <textarea
                style={{ ...inputStyle, height: '80px', resize: 'vertical' as const }}
                value={(selected.best_break ?? selected.best_run) ?? ''}
                onChange={e => setSelected({ ...selected, best_break: e.target.value, best_run: e.target.value })}
              />

              <label style={labelStyle}>Ideal Conditions</label>
              <input style={inputStyle} value={selected.ideal_conditions ?? ''} onChange={e => setSelected({ ...selected, ideal_conditions: e.target.value })} />
            </div>

            <div>
              <label style={labelStyle}>Flight Price (USD)</label>
              <input style={inputStyle} type="number" value={selected.flight_price ?? ''} onChange={e => setSelected({ ...selected, flight_price: parseInt(e.target.value) })} />

              <label style={labelStyle}>Hotel Price per night (USD)</label>
              <input style={inputStyle} type="number" value={selected.hotel_price ?? ''} onChange={e => setSelected({ ...selected, hotel_price: parseInt(e.target.value) })} />

              <label style={labelStyle}>Best Months (comma separated, 1-12)</label>
              <input
                style={inputStyle}
                value={selected.best_months?.join(', ') ?? ''}
                onChange={e => setSelected({ ...selected, best_months: e.target.value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n)) })}
              />

              <label style={labelStyle}>Local Tips (one per line)</label>
              <textarea
                style={{ ...inputStyle, height: '160px', resize: 'vertical' as const }}
                value={selected.local_tips?.join('\n') ?? ''}
                onChange={e => setSelected({ ...selected, local_tips: e.target.value.split('\n').filter(t => t.trim()) })}
              />
            </div>
          </div>

          {/* WEEKEND TRIP */}
          <div style={{ marginTop: '32px', borderTop: '1px solid #1a1510', paddingTop: '32px' }}>
            <label style={{ ...labelStyle, fontSize: '13px' }}>Weekend Trip — Day Plans</label>
            {selected.weekend_trip?.days?.map((day: any, i: number) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#4a4540', marginBottom: '4px', letterSpacing: '1px' }}>{day.day}</div>
                <textarea
                  style={{ ...inputStyle, height: '60px', resize: 'vertical' as const, marginBottom: '0' }}
                  value={day.plan}
                  onChange={e => {
                    const newDays = [...selected.weekend_trip.days];
                    newDays[i] = { ...day, plan: e.target.value };
                    setSelected({ ...selected, weekend_trip: { ...selected.weekend_trip, days: newDays } });
                  }}
                />
              </div>
            ))}
          </div>

          {/* WEEK TRIP */}
          <div style={{ marginTop: '32px', borderTop: '1px solid #1a1510', paddingTop: '32px' }}>
            <label style={{ ...labelStyle, fontSize: '13px' }}>Week Trip — Day Plans</label>
            {selected.week_trip?.days?.map((day: any, i: number) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#4a4540', marginBottom: '4px', letterSpacing: '1px' }}>{day.day}</div>
                <textarea
                  style={{ ...inputStyle, height: '60px', resize: 'vertical' as const, marginBottom: '0' }}
                  value={day.plan}
                  onChange={e => {
                    const newDays = [...selected.week_trip.days];
                    newDays[i] = { ...day, plan: e.target.value };
                    setSelected({ ...selected, week_trip: { ...selected.week_trip, days: newDays } });
                  }}
                />
              </div>
            ))}
          </div>

        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a4540' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>←</div>
            <div style={{ fontSize: '18px' }}>Select a spot to edit</div>
          </div>
        </div>
      )}
    </main>
  );
}
