'use client';
import { useState } from 'react';

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <style>{`
        .mobile-nav-btn { display: none; }
        .desktop-nav { display: flex; gap: 20px; align-items: center; }
        @media (max-width: 768px) {
          .mobile-nav-btn { display: block; }
          .desktop-nav { display: none; }
        }
      `}</style>

      <button
        className="mobile-nav-btn"
        onClick={() => setOpen(!open)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '4px', color: '#f0ebe0',
        }}
      >
        <div style={{ width: '22px', height: '2px', background: '#f0ebe0', marginBottom: '5px' }}/>
        <div style={{ width: '22px', height: '2px', background: '#f0ebe0', marginBottom: '5px' }}/>
        <div style={{ width: '22px', height: '2px', background: '#f0ebe0' }}/>
      </button>

      <div className="desktop-nav">
        <a href="/" style={{ color: '#6b6560', textDecoration: 'none', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Home</a>
        <a href="/hotlist" style={{ color: '#6b6560', textDecoration: 'none', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Hot Trips</a>
        <a href="/strikes" style={{ color: '#0a0808', textDecoration: 'none', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', background: '#f0ebe0', padding: '8px 16px', borderRadius: '2px', fontWeight: 'bold' }}>Score Now</a>
        <a href="/about" style={{ color: '#6b6560', textDecoration: 'none', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>About</a>
      </div>

      {open && (
        <div style={{
          position: 'fixed', top: '52px', left: 0, right: 0, bottom: 0,
          background: '#0a0808', zIndex: 200, padding: '32px 24px',
          display: 'flex', flexDirection: 'column', gap: '24px',
        }}>
          {[
            { href: '/', label: 'Home' },
            { href: '/hotlist', label: 'Hot Trips' },
            { href: '/strikes', label: 'Score Now' },
            { href: '/about', label: 'About' },
          ].map(link => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)} style={{
              color: '#f0ebe0', textDecoration: 'none', fontSize: '28px',
              fontWeight: 'bold', letterSpacing: '-1px', fontFamily: 'Georgia, serif',
              borderBottom: '1px solid #1a1510', paddingBottom: '24px',
            }}>
              {link.label}
            </a>
          ))}
          <a href="/strikes" onClick={() => setOpen(false)} style={{
            display: 'block', padding: '18px', background: '#f0ebe0',
            color: '#0a0808', textDecoration: 'none', fontSize: '14px',
            fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase',
            textAlign: 'center', marginTop: '8px',
          }}>
            Score Now →
          </a>
        </div>
      )}
    </>
  );
}
