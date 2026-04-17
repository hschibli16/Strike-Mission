import { supabase } from './supabase';
import { ALL_SPOTS } from '../spots';

export async function getSpotsFromDB() {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .order('name');

    if (error || !data || data.length === 0) {
      console.log('Falling back to static spots');
      return ALL_SPOTS;
    }

    const seen = new Set<string>();
    const deduped = data.filter((spot: any) => {
      if (seen.has(spot.slug)) return false;
      seen.add(spot.slug);
      return true;
    });

    return deduped.map((spot: any) => ({
      slug: spot.slug,
      name: spot.name,
      location: spot.location,
      country: spot.country,
      type: spot.type as 'surf' | 'ski',
      lat: spot.lat,
      lon: spot.lon,
      airportCode: spot.airport_code,
      flag: spot.flag,
      tagline: spot.tagline,
      description: spot.description,
      bestMonths: spot.best_months ?? [],
      flightFrom: spot.flight_from,
      flightPrice: spot.flight_price,
      hotelPrice: spot.hotel_price,
      bestBreak: spot.best_break,
      idealConditions: spot.ideal_conditions,
      idealSwellDirection: spot.ideal_swell_direction,
      idealWindDirection: spot.ideal_wind_direction,
      bestRun: spot.best_run,
      localTips: spot.local_tips ?? [],
      weekendTrip: spot.weekend_trip,
      weekTrip: spot.week_trip,
    }));
  } catch {
    console.log('Supabase error, falling back to static spots');
    return ALL_SPOTS;
  }
}

export async function getSpotBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return ALL_SPOTS.find(s => s.slug === slug) ?? null;
    }

    return {
      slug: data.slug,
      name: data.name,
      location: data.location,
      country: data.country,
      type: data.type as 'surf' | 'ski',
      lat: data.lat,
      lon: data.lon,
      airportCode: data.airport_code,
      flag: data.flag,
      tagline: data.tagline,
      description: data.description,
      bestMonths: data.best_months ?? [],
      flightFrom: data.flight_from,
      flightPrice: data.flight_price,
      hotelPrice: data.hotel_price,
      bestBreak: data.best_break,
      idealConditions: data.ideal_conditions,
      idealSwellDirection: data.ideal_swell_direction,
      idealWindDirection: data.ideal_wind_direction,
      bestRun: data.best_run,
      localTips: data.local_tips ?? [],
      weekendTrip: data.weekend_trip,
      weekTrip: data.week_trip,
    };
  } catch {
    return ALL_SPOTS.find(s => s.slug === slug) ?? null;
  }
}
