'use client';

import { useState } from 'react';

export default function NotifyWhenLiveForm({ spotName }: { spotName: string }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div style={{ fontSize: '14px', fontFamily: "'Georgia', serif", color: '#4ade80' }}>
        Thanks — we&apos;ll email you when {spotName} is live.
      </div>
    );
  }

  return (
    <>
      <style>{`
        .notify-form { display: flex; gap: 8px; }
        @media (max-width: 600px) {
          .notify-form { flex-direction: column; }
          .notify-form input,
          .notify-form button { width: 100%; box-sizing: border-box; }
        }
      `}</style>
      <form
        className="notify-form"
        onSubmit={(e) => {
          e.preventDefault();
          console.log('notify signup', { email, spotName });
          setSubmitted(true);
        }}
      >
        <input
          type="email"
          placeholder="you@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 16px',
            background: 'transparent',
            border: '1px solid #2a2520',
            color: '#f0ebe0',
            fontSize: '14px',
            fontFamily: "'Georgia', serif",
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '12px 24px',
            background: '#f0ebe0',
            color: '#0a0808',
            border: 'none',
            fontSize: '12px',
            fontFamily: "'Georgia', serif",
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          NOTIFY ME WHEN LIVE
        </button>
      </form>
    </>
  );
}
