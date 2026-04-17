import 'leaflet/dist/leaflet.css';
import { getSpotsFromDB } from '../lib/getSpots';
import { getSwellData } from '../stormglass';
import { getSnowForecast } from '../weather';
import { scoreSurfSpot, scoreSkiSpot, getStrikeLabel, getSkiLabel } from '../scoring';
import MobileNav from '../components/MobileNav';
import SearchBar from '../components/SearchBar';
import GuideFilters from '../components/GuideFilters';

export default async function GuidePage() {
  const allSpots = await getSpotsFromDB();
  const surfSpots = allSpots.filter(s => s.type === 'surf');
  const skiSpots = allSpots.filter(s => s.type === 'ski');

  const surfWithConditions = await Promise.all(
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
      const strike = getStrikeLabel(score);
      return { ...spot, swell, score, strike };
    })
  );

  const skiWithConditions = await Promise.all(
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
      const strike = getSkiLabel(score);
      return { ...resort, totalSnowCm: totalSnowCm.toFixed(1), totalSnowIn, score, strike };
    })
  );

  const sortedSurf = surfWithConditions.sort((a, b) => b.score - a.score);
  const sortedSki = skiWithConditions.sort((a, b) => b.score - a.score);

  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#0a0808', minHeight: '100vh', color: '#f0ebe0' }}>
      <nav style={{
        padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #1a1510', position: 'sticky', top: 0, background: 'rgba(10,8,8,0.97)', zIndex: 100,
      }}>
        <a href="/" style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase', color: '#f0ebe0', textDecoration: 'none' }}>
          Strike Mission
        </a>
        <MobileNav />
      </nav>

      <div style={{ padding: '60px 60px 32px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ebe0', opacity: 0.5, marginBottom: '16px' }}>
          The Ultimate Travel Guide
        </div>
        <h1 style={{ fontSize: '56px', fontWeight: 'bold', margin: '0 0 16px', letterSpacing: '-3px', lineHeight: 1 }}>
          Where to Go.<br/>When to Go.
        </h1>
        <p style={{ color: '#6b6560', fontSize: '16px', maxWidth: '500px', lineHeight: 1.7, marginBottom: '32px' }}>
          Every surf break and ski resort ranked by live conditions. Click any spot for the full trip guide.
        </p>
        <SearchBar placeholder="Search spots, countries, regions..." />
      </div>

      <GuideFilters
        surfSpots={sortedSurf}
        skiSpots={sortedSki}
        totalCount={allSpots.length}
      />
    </main>
  );
}
