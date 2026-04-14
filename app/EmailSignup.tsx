'use client';
import { useState } from 'react';

export default function EmailSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit() {
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div style={{ padding: '20px', background: '#1a1510', borderLeft: '3px solid #e8823a' }}>
        <div style={{ color: '#e8823a', fontWeight: 'bold', marginBottom: '4px' }}>⚡ You're in.</div>
        <div style={{ color: '#6b6560', fontSize: '14px' }}>We'll hit you up when conditions are firing.</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '0' }}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        placeholder="your@email.com"
        style={{
          flex: 1, padding: '16px 20px', background: '#0a0808',
          border: '1px solid #2a2520', borderRight: 'none',
          color: '#f0ebe0', fontSize: '16px', outline: 'none',
          fontFamily: 'Georgia, serif'
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={status === 'loading'}
        style={{
          padding: '16px 28px', background: '#e8823a',
          color: '#0a0808', border: 'none', fontSize: '13px',
          fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase',
          cursor: 'pointer', whiteSpace: 'nowrap'
        }}
      >
        {status === 'loading' ? '...' : 'Alert Me →'}
      </button>
    </div>
  );
}
