import { NextResponse } from 'next/server';
import { getSpotsFromDB } from '../../../lib/getSpots';
import { getUnifiedConditionsForSpots } from '../../../lib/conditions/unified';

export async function GET() {
  const start = Date.now();
  const spots = await getSpotsFromDB();
  const results = await getUnifiedConditionsForSpots(spots);
  const elapsedMs = Date.now() - start;

  const ranked = results
    .sort((a, b) => b.score - a.score)
    .map(r => ({
      spot: r.spot.name,
      slug: r.spot.slug,
      score: r.score,
      verdict: r.verdict,
      heightFt: r.estimatedBreakHeightFt?.toFixed(1) ?? null,
      periodS: r.periodS?.toFixed(1) ?? null,
      windMph: r.windSpeedMph?.toFixed(0) ?? null,
      windScore: r.windDirectionScore,
      confidence: r.confidence,
      confidenceReason: r.confidenceReason,
      dataSource: r.dataSource,
      ageMinutes: r.ageMinutes,
    }));

  return NextResponse.json({
    count: ranked.length,
    elapsedMs,
    ranked,
  });
}
