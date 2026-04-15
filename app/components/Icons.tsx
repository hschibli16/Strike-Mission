export function SurferIcon({ size = 24, color = '#f0ebe0' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="3.5" r="1.5" fill={color}/>
      <path d="M7 14l3-5 2 2 2-3 3 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M3 18c2-2 4-3 6-2l4-4 4 2 3-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M2 21c3-3 6-4 9-2s6 1 9-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export function SkierIcon({ size = 24, color = '#f0ebe0' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="17" cy="3.5" r="1.5" fill={color}/>
      <path d="M3 20l5-2 2-4 3 1 2-4 3 1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M9 14l-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M1 22h6M15 22h7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function BoltIcon({ size = 24, color = '#e8823a' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="13,2 6,14 11,14 9,22 18,9 13,9 16,2" fill={color}/>
    </svg>
  );
}

export function FlagIcon({ country, size = 20 }: { country: string; size?: number }) {
  const flags: Record<string, string> = {
    'USA': 'US',
    'Canada': 'CA',
    'France': 'FR',
    'Portugal': 'PT',
    'Indonesia': 'ID',
    'South Africa': 'ZA',
    'Japan': 'JP',
    'Switzerland': 'CH',
    'Fiji': 'FJ',
    'Mexico': 'MX',
    'Australia': 'AU',
  };
  
  const code = flags[country] ?? 'UN';
  
  return (
    <img 
      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
      alt={country}
      width={size * 1.5}
      height={size}
      style={{ objectFit: 'cover', borderRadius: '2px', display: 'inline-block' }}
    />
  );
}
