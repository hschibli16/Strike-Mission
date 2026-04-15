import { SURF_SPOTS, SKI_RESORTS } from '../spots';
import { getSwellData } from '../stormglass';
import { getSnowForecast } from '../weather';
import StrikesClient from './StrikesClient';

function getWaveRating(waveHeight: string | null) {
  const h = parseFloat(waveHeight ?? '0');
  if (isNaN(h)) return { label: 'NO DATA', color: '#4a4540' };
  if (h >= 2.5) return { label: 'FIRING', color: '#e8823a' };
  if (h >= 1.5) return { label: 'GOOD', color: '#c8a882' };
  if (h >= 0.8) return { label: 'FAIR', color: '#8a7a6a' };
  return { label: 'SMALL', color: '#4a4540' };
}

function getSnowRating(totalSnow: number) {
  if (totalSnow >= 30) return { label: 'EPIC', color: '#e8823a' };
  if (totalSnow >= 15) return { label: 'GREAT', color: '#c8a882' };
  if (totalSnow >= 5) return { label: 'GOOD', color: '#8a7a6a' };
  return { label: 'THIN', color: '#4a4540' };
}

export default async function StrikeMissions() {
  const surfData = await Promise.all(
    SURF_SPOTS.map(async (spot) => {
      const swell = await getSwellData(spot.lat, spot.lon);
      const rating = getWaveRating(swell?.waveHeight ?? null);
      const tripCost = spot.flightPrice + (spot.hotelPrice * 5);
      return {
        ...spot,
        price: spot.flightPrice,
        hotel: spot.hotelPrice,
        swell,
        rating,
        tripCost,
      };
    })
  );

  const snowData = await Promise.all(
    SKI_RESORTS.map(async (resort) => {
      const forecast = await getSnowForecast(resort.lat, resort.lon);
      const totalSnowCm = forecast.daily.snowfall_sum.reduce((a: number, b: number) => a + b, 0);
      const totalSnowIn = (totalSnowCm / 2.54).toFixed(1);
      const rating = getSnowRating(totalSnowCm);
      const tripCost = resort.flightPrice + (resort.hotelPrice * 5);
      return {
        ...resort,
        price: resort.flightPrice,
        hotel: resort.hotelPrice,
        totalSnowCm: totalSnowCm.toFixed(1),
        totalSnowIn,
        rating,
        tripCost,
      };
    })
  );

  const sortedSurf = surfData.sort((a, b) => parseFloat(b.swell?.waveHeight ?? '0') - parseFloat(a.swell?.waveHeight ?? '0'));
  const sortedSnow = snowData.sort((a, b) => parseFloat(b.totalSnowCm) - parseFloat(a.totalSnowCm));

  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#0a0808', minHeight: '100vh', color: '#f0ebe0' }}>

      {/* NAV */}
      <nav style={{
        padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #1a1510'
      }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <img src="/logo.svg" alt="Strike Mission" style={{ height: '48px' }} />
        </a>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <a href="/" style={{ color: '#6b6560', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase' }}>Conditions</a>
          <a href="/about" style={{ color: '#6b6560', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase' }}>About</a>
          <a href="/strikes" style={{
            color: '#0a0808', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px',
            textTransform: 'uppercase', background: '#e8823a', padding: '10px 20px', borderRadius: '2px', fontWeight: 'bold'
          }}>Strike Missions</a>
        </div>
      </nav>

      {/* HERO BANNER */}
      <div style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1800&q=80"
          alt="Strike Missions"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35) contrast(1.15)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, #0a0808)' }} />
        <div style={{ position: 'absolute', bottom: '40px', left: '60px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#e8823a', marginBottom: '12px' }}>
            Conditions are firing
          </div>
          <h1 style={{ fontSize: '56px', fontWeight: 'bold', margin: 0, letterSpacing: '-2px', lineHeight: 1 }}>
            STRIKE MISSIONS
          </h1>
          <p style={{ color: '#6b6560', marginTop: '8px', fontSize: '16px' }}>
            Real data. Real trips. Go score.
          </p>
        </div>
      </div>

      <StrikesClient surfSpots={sortedSurf} snowSpots={sortedSnow} />

    </main>
  );
}
