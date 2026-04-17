import { supabaseAdmin } from '../../lib/supabase';
import { ALL_SPOTS } from '../../spots';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const seen = new Set<string>();
    const spotsToInsert = ALL_SPOTS
      .filter(spot => {
        if (seen.has(spot.slug)) return false;
        seen.add(spot.slug);
        return true;
      })
      .map(spot => ({
      slug: spot.slug,
      name: spot.name,
      location: spot.location,
      country: spot.country,
      type: spot.type,
      lat: spot.lat,
      lon: spot.lon,
      airport_code: spot.airportCode,
      flag: spot.flag,
      tagline: spot.tagline,
      description: spot.description,
      best_months: spot.bestMonths,
      flight_from: spot.flightFrom,
      flight_price: spot.flightPrice,
      hotel_price: spot.hotelPrice,
      best_break: spot.bestBreak ?? null,
      ideal_conditions: spot.idealConditions ?? null,
      ideal_swell_direction: spot.idealSwellDirection ?? null,
      ideal_wind_direction: spot.idealWindDirection ?? null,
      best_run: spot.bestRun ?? null,
      local_tips: spot.localTips,
      weekend_trip: spot.weekendTrip,
      week_trip: spot.weekTrip,
    }));

    const { data, error } = await supabaseAdmin
      .from('spots')
      .upsert(spotsToInsert, { onConflict: 'slug' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${spotsToInsert.length} spots successfully`,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
