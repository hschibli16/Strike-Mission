export default function StrikeMissions() {
  return (
    <main style={{ fontFamily: 'sans-serif', background: '#0a0a0a', minHeight: '100vh', color: 'white', padding: '40px' }}>
      
      <div style={{ borderBottom: '1px solid #222', paddingBottom: '20px', marginBottom: '40px' }}>
        <a href="/" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>← Back to Conditions</a>
        <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: '#00d4ff', margin: '12px 0 0' }}>⚡ Strike Missions</h1>
        <p style={{ fontSize: '18px', color: '#888', marginTop: '8px' }}>
          Conditions are firing. Here's where to go this week.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        <div style={{ background: '#111', borderRadius: '16px', border: '1px solid #00d4ff', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #003344, #001122)', padding: '24px' }}>
            <div style={{ fontSize: '13px', color: '#00d4ff', fontWeight: 'bold', marginBottom: '8px' }}>🏄 SURF STRIKE</div>
            <h2 style={{ fontSize: '28px', margin: '0 0 4px' }}>Nicaragua</h2>
            <p style={{ color: '#888', margin: 0 }}>Playa Maderas · This Weekend</p>
          </div>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '12px 16px', flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#00d4ff' }}>2.1m</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Wave Height</div>
              </div>
              <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '12px 16px', flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#00d4ff' }}>12s</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Period</div>
              </div>
              <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '12px 16px', flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#00d4ff' }}>Offshore</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Wind</div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #222', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Return flights from NYC</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>~$380</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Hostel/night</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>~$25</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#666' }}>5 day trip est.</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00d4ff' }}>~$530</div>
                </div>
              </div>
              <button style={{
                width: '100%', padding: '14px', background: '#00d4ff', color: '#000',
                border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
              }}>
                Book This Strike →
              </button>
            </div>
          </div>
        </div>

        <div style={{ background: '#111', borderRadius: '16px', border: '1px solid #444', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #001a33, #000d1a)', padding: '24px' }}>
            <div style={{ fontSize: '13px', color: '#aaa', fontWeight: 'bold', marginBottom: '8px' }}>🎿 SNOW STRIKE</div>
            <h2 style={{ fontSize: '28px', margin: '0 0 4px' }}>Snowbird</h2>
            <p style={{ color: '#888', margin: 0 }}>Utah · This Week</p>
          </div>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '12px 16px', flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#00d4ff' }}>16cm</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Fresh Snow</div>
              </div>
              <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '12px 16px', flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#00d4ff' }}>-8°C</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Temp</div>
              </div>
              <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '12px 16px', flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#00d4ff' }}>Light</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Wind</div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #222', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Return flights from NYC</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>~$280</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Hotel/night</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>~$120</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#666' }}>5 day trip est.</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00d4ff' }}>~$880</div>
                </div>
              </div>
              <button style={{
                width: '100%', padding: '14px', background: '#00d4ff', color: '#000',
                border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
              }}>
                Book This Strike →
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}