export default function About() {
  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#0a0808', minHeight: '100vh', color: '#f0ebe0' }}>
      
      <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1a1510' }}>
        <a href="/" style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase', color: '#f0ebe0', textDecoration: 'none' }}>Strike Mission</a>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <a href="/" style={{ color: '#6b6560', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase' }}>Conditions</a>
          <a href="/hotlist" style={{ color: '#6b6560', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase' }}>Hot List</a>
          <a href="/strikes" style={{ color: '#0a0808', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', background: '#e8823a', padding: '10px 20px', borderRadius: '2px', fontWeight: 'bold' }}>Book a Strike</a>
        </div>
      </nav>

      <div style={{ position: 'relative', height: '60vh', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1800&q=80"
          alt="Surfer"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3) contrast(1.2)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, #0a0808)' }} />
        <div style={{ position: 'absolute', bottom: '60px', left: '60px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '12px' }}>Our story</div>
          <h1 style={{ fontSize: '72px', fontWeight: 'bold', margin: 0, letterSpacing: '-2px', lineHeight: 1 }}>ABOUT</h1>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 40px' }}>
        
        <div style={{ marginBottom: '64px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '16px' }}>How it started</div>
          <p style={{ fontSize: '22px', lineHeight: 1.8, color: '#f0ebe0', marginBottom: '24px', fontStyle: 'italic' }}>
            "I kept seeing the forecast light up — epic powder in BC, perfect swell in Portugal — and doing nothing about it because booking a last-minute trip felt impossible."
          </p>
          <p style={{ fontSize: '17px', lineHeight: 1.9, color: '#b0a898', marginBottom: '20px' }}>
            Strike Mission was born out of that frustration. As a surfer and skier who has chased waves and snow around the world, I know how rare it is when conditions truly align. The problem was never motivation — it was the gap between seeing a great forecast and actually being on a plane.
          </p>
          <p style={{ fontSize: '17px', lineHeight: 1.9, color: '#b0a898', marginBottom: '20px' }}>
            Every great surf or ski trip has a window. Miss it and you are watching someone else's clips for the next six months. Strike Mission exists to close that gap — to be the tool that turns a great forecast into a booked trip in minutes, not days.
          </p>
        </div>

        <div style={{ borderTop: '1px solid #1a1510', borderBottom: '1px solid #1a1510', padding: '48px 0', marginBottom: '64px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#e8823a', marginBottom: '8px' }}>20+</div>
            <div style={{ fontSize: '13px', color: '#4a4540', letterSpacing: '2px', textTransform: 'uppercase' }}>Surf spots tracked</div>
          </div>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#e8823a', marginBottom: '8px' }}>20+</div>
            <div style={{ fontSize: '13px', color: '#4a4540', letterSpacing: '2px', textTransform: 'uppercase' }}>Ski resorts tracked</div>
          </div>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#e8823a', marginBottom: '8px' }}>24/7</div>
            <div style={{ fontSize: '13px', color: '#4a4540', letterSpacing: '2px', textTransform: 'uppercase' }}>Live conditions</div>
          </div>
        </div>

        <div style={{ marginBottom: '64px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '16px' }}>What we do</div>
          <p style={{ fontSize: '17px', lineHeight: 1.9, color: '#b0a898', marginBottom: '20px' }}>
            We scan surf and snow forecasts across the world's best destinations every day. When conditions are lining up somewhere special, we surface it — along with everything you need to go: flight costs, accommodation options, local tips, and a day-by-day trip outline.
          </p>
          <p style={{ fontSize: '17px', lineHeight: 1.9, color: '#b0a898', marginBottom: '20px' }}>
            Right now we use Stormglass wave models and Open-Meteo snow forecasts. As we grow, we will integrate more data sources and more precise local forecasts to make the predictions sharper and the recommendations smarter.
          </p>
          <p style={{ fontSize: '17px', lineHeight: 1.9, color: '#b0a898' }}>
            The goal is simple: you open Strike Mission, see where conditions are firing this week, pick a trip, and go. We handle the research. You handle the packing.
          </p>
        </div>

        <div style={{ marginBottom: '64px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '16px' }}>The vision</div>
          <p style={{ fontSize: '17px', lineHeight: 1.9, color: '#b0a898', marginBottom: '20px' }}>
            Eventually Strike Mission will book the whole trip for you — flights, accommodation, transfers, gear rental — all in one place, triggered by a great forecast. You will get a notification on a Monday morning saying "Nicaragua is firing this weekend, here is your trip for $530 all in. Want to go?"
          </p>
          <p style={{ fontSize: '17px', lineHeight: 1.9, color: '#b0a898' }}>
            We are building toward that. One forecast, one click, one strike mission.
          </p>
        </div>

        <div style={{ background: '#111010', borderTop: '2px solid #e8823a', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '12px' }}>Get involved</div>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 12px', letterSpacing: '-1px' }}>Stay in the loop</h3>
          <p style={{ color: '#6b6560', marginBottom: '24px', fontSize: '15px' }}>Sign up to get the weekly Hot List — the top 5 surf and ski strikes delivered every Monday.</p>
          <a href="/#conditions" style={{ display: 'inline-block', padding: '16px 40px', background: '#e8823a', color: '#0a0808', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Sign Up →
          </a>
        </div>

      </div>
    </main>
  );
}
