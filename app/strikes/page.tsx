import { getSpotsFromDB } from '../lib/getSpots';
import { getSwellData } from '../stormglass';
import { getSnowForecast } from '../weather';
import { scoreSurfSpot, scoreSkiSpot, getStrikeLabel, getSkiLabel } from '../scoring';
import MobileNav from '../components/MobileNav';
import StrikesClient from './StrikesClient';

export default async function StrikeMissions() {
  const allSpots = await getSpotsFromDB();
  const surfSpots = allSpots.filter(s => s.type === 'surf');
  const skiSpots = allSpots.filter(s => s.type === 'ski');

  const surfData = await Promise.all(
    surfSpots.map(async (spot) => {
      const swell = await getSwellData(spot.lat, spot.lon);
      const score = scoreSurfSpot({
        waveHeight: swell?.waveHeightFt ?? null,
        wavePeriod: swell?.wavePeriod ?? null,
        swellDirection: swell?.swellDirection ?? null,
        windDirection: swell?.windDirection ?? null,
        windSpeed: swell?.windSpeed ?? null,
        idealSwellDirection: spot.idealSwellDirection,
        idealWindDirection: spot.idealWindDirection,
        bestMonths: spot.bestMonths,
        flightPrice: spot.flightPrice,
      });
      const rating = getStrikeLabel(score);
      const tripCost = spot.flightPrice + (spot.hotelPrice * 5);
      return {
        ...spot,
        swell,
        rating,
        score,
        tripCost,
        flightPrice: spot.flightPrice,
        hotelPrice: spot.hotelPrice,
        totalSnowIn: undefined,
        totalSnowCm: undefined,
      };
    })
  );

  const snowData = await Promise.all(
    skiSpots.map(async (resort) => {
      const forecast = await getSnowForecast(resort.lat, resort.lon);
      const totalSnowCm = forecast.consensus
        ? parseFloat(forecast.consensus.totalSnowCm)
        : forecast.daily.snowfall_sum.reduce((a: number, b: number) => a + b, 0);
      const totalSnowIn = (totalSnowCm / 2.54).toFixed(1);
      const score = scoreSkiSpot({
        totalSnowCm,
        bestMonths: resort.bestMonths,
        flightPrice: resort.flightPrice,
      });
      const rating = getSkiLabel(score);
      const tripCost = resort.flightPrice + (resort.hotelPrice * 5);
      return {
        ...resort,
        totalSnowCm: totalSnowCm.toFixed(1),
        totalSnowIn,
        rating,
        score,
        tripCost,
        flightPrice: resort.flightPrice,
        hotelPrice: resort.hotelPrice,
        swell: undefined,
      };
    })
  );

  const sortedSurf = surfData.sort((a, b) => b.score - a.score);
  const sortedSnow = snowData.sort((a, b) => b.score - a.score);

  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#0a0808', minHeight: '100vh', color: '#f0ebe0' }}>
      <nav style={{
        padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #1a1510', position: 'sticky', top: 0,
        background: 'rgba(10,8,8,0.97)', zIndex: 100,
      }}>
        <a href="/" style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase', color: '#f0ebe0', textDecoration: 'none' }}>
          Strike Mission
        </a>
        <MobileNav />
      </nav>

      <div style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1800&q=80"
          alt="Strike Missions"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35) contrast(1.15)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, #0a0808)' }} />
        <div style={{ position: 'absolute', bottom: '40px', left: '60px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.5, marginBottom: '12px' }}>
            Ranked by live conditions
          </div>
          <h1 style={{ fontSize: '56px', fontWeight: 'bold', margin: 0, letterSpacing: '-2px', lineHeight: 1 }}>
            SCORE NOW
          </h1>
          <p style={{ color: '#6b6560', marginTop: '8px', fontSize: '16px' }}>
            Every surf and ski destination scored and ranked in real time.
          </p>
        </div>
      </div>

      <StrikesClient surfSpots={sortedSurf} snowSpots={sortedSnow} />
    </main>
  );
}
