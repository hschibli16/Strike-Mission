'use client';
import { useEffect, useState } from 'react';

type TickerItem = {
  label: string;
  value: string;
  type: 'surf' | 'ski';
};

export default function Ticker({ items }: { items: TickerItem[] }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prev => prev - 1);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const doubled = [...items, ...items];

  return (
    <div style={{
      background: '#e8823a',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
    }}>
      <div style={{
        display: 'inline-flex',
        gap: '0px',
        transform: `translateX(${offset % (items.length * 300)}px)`,
        transition: 'none',
      }}>
        {doubled.map((item, i) => (
          <span key={i} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 32px',
            fontSize: '12px',
            fontFamily: 'Georgia, serif',
            fontWeight: 'bold',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#0a0808',
            borderRight: '1px solid rgba(0,0,0,0.15)',
          }}>
            <span>{item.type === 'surf' ? '🏄' : '🎿'}</span>
            <span>{item.label}</span>
            <span style={{ opacity: 0.7 }}>·</span>
            <span>{item.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
