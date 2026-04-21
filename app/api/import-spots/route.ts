import { supabaseAdmin } from '../../lib/supabase';
import { ALL_SPOTS } from '../../spots';
import { REGIONS } from '../../regions';
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
      ski_resort_query: spot.skiResortQuery ?? null,
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
      buoy_id: spot.buoyId ?? null,
      tide_station_id: spot.tideStationId ?? null,
      refraction_coefficient: spot.refractionCoefficient ?? null,
      min_useful_period: spot.minUsefulPeriod ?? null,
      region_slug: spot.regionSlug ?? null,
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

    const regionRows = REGIONS.map(r => ({
      slug: r.slug,
      name: r.name,
      type: r.type,
      short_description: r.shortDescription,
      long_description: r.longDescription,
      hero_image: r.heroImage,
      best_months: r.bestMonths,
      season_note: r.seasonNote,
      countries: r.countries,
      centroid_lat: r.centroidLat ?? null,
      centroid_lon: r.centroidLon ?? null,
      focus_zoom: r.focusZoom ?? null,
    }));

    const { error: regionError } = await supabaseAdmin
      .from('regions')
      .upsert(regionRows, { onConflict: 'slug' });

    if (regionError) {
      console.warn('[import-spots] regions table upsert failed (run CREATE TABLE migration?):', regionError.message);
    }

    return NextResponse.json({
      success: true,
      spotsUpserted: spotsToInsert.length,
      regionsUpserted: regionError ? 0 : regionRows.length,
      regionsWarning: regionError ? regionError.message : null,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
