export function SurferIcon({ size = 24, color = '#f0ebe0' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 18c2-2 4-3 6-2s4 1 6 0 4-2 6-1" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M2 21c2-2 4-3 6-2s4 1 6 0 4-2 6-1" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
      <path d="M12 14l3-5-4-2 2-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="13" cy="4" r="1.2" fill={color}/>
    </svg>
  );
}

export function SkierIcon({ size = 24, color = '#f0ebe0' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="4" r="1.2" fill={color}/>
      <path d="M2 20l5-2 3-5 3 2 2-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1 22h5M14 22h8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function SnowflakeIcon({ size = 24, color = '#f0ebe0' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="2" x2="12" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="2" x2="9" y2="5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="2" x2="15" y2="5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="22" x2="9" y2="19" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="22" x2="15" y2="19" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2" y1="12" x2="5" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2" y1="12" x2="5" y2="15" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="22" y1="12" x2="19" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="22" y1="12" x2="19" y2="15" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function WaveIcon({ size = 24, color = '#f0ebe0' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 10c1.5-2 3-3 4.5-2S9 10 10.5 10s3-2 4.5-2 3 1 4.5 2 2.5 1 2.5 1" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M2 15c1.5-2 3-3 4.5-2S9 15 10.5 15s3-2 4.5-2 3 1 4.5 2 2.5 1 2.5 1" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function BoltIcon({ size = 24, color = '#f0ebe0' }: { size?: number; color?: string }) {
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
    'New Zealand': 'NZ',
    'Peru': 'PE',
    'Namibia': 'NA',
    'Spain': 'ES',
    'French Polynesia': 'PF',
    'Nicaragua': 'NI',
    'Austria': 'AT',
    'Italy': 'IT',
    'United States': 'US',
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
