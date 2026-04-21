import { supabase } from './supabase';
import { ALL_SPOTS, Spot } from '../spots';
import { Region, REGIONS } from '../regions';

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
      skiResortQuery: spot.ski_resort_query ?? undefined,
      bestRun: spot.best_run,
      localTips: spot.local_tips ?? [],
      weekendTrip: spot.weekend_trip,
      weekTrip: spot.week_trip,
      buoyId: spot.buoy_id ?? null,
      tideStationId: spot.tide_station_id ?? null,
      refractionCoefficient: spot.refraction_coefficient ?? undefined,
      minUsefulPeriod: spot.min_useful_period ?? undefined,
      regionSlug: spot.region_slug ?? '',
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
      skiResortQuery: data.ski_resort_query ?? undefined,
      bestRun: data.best_run,
      localTips: data.local_tips ?? [],
      weekendTrip: data.weekend_trip,
      weekTrip: data.week_trip,
      buoyId: data.buoy_id ?? null,
      tideStationId: data.tide_station_id ?? null,
      refractionCoefficient: data.refraction_coefficient ?? undefined,
      minUsefulPeriod: data.min_useful_period ?? undefined,
      regionSlug: data.region_slug ?? '',
    };
  } catch {
    return ALL_SPOTS.find(s => s.slug === slug) ?? null;
  }
}

export async function getAllRegions(): Promise<Region[]> {
  try {
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .order('name');
    if (error) throw error;
    if (!data || data.length === 0) return REGIONS;
    return data.map((r: any) => ({
      slug: r.slug,
      name: r.name,
      type: r.type as 'surf' | 'ski',
      shortDescription: r.short_description ?? '',
      longDescription: r.long_description ?? '',
      heroImage: r.hero_image ?? '',
      bestMonths: r.best_months ?? [],
      seasonNote: r.season_note ?? '',
      countries: r.countries ?? [],
      centroidLat: r.centroid_lat ?? undefined,
      centroidLon: r.centroid_lon ?? undefined,
      focusZoom: r.focus_zoom ?? undefined,
    }));
  } catch (err) {
    console.warn('[regions] fetch failed, using static fallback:', err);
    return REGIONS;
  }
}

export async function getRegionBySlug(slug: string): Promise<Region | null> {
  try {
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error || !data) throw error ?? new Error('not found');
    return {
      slug: data.slug,
      name: data.name,
      type: data.type as 'surf' | 'ski',
      shortDescription: data.short_description ?? '',
      longDescription: data.long_description ?? '',
      heroImage: data.hero_image ?? '',
      bestMonths: data.best_months ?? [],
      seasonNote: data.season_note ?? '',
      countries: data.countries ?? [],
      centroidLat: data.centroid_lat ?? undefined,
      centroidLon: data.centroid_lon ?? undefined,
      focusZoom: data.focus_zoom ?? undefined,
    };
  } catch {
    return REGIONS.find(r => r.slug === slug) ?? null;
  }
}

export async function getSpotsInRegion(regionSlug: string): Promise<Spot[]> {
  const allSpots = await getSpotsFromDB();
  return allSpots.filter(s => s.regionSlug === regionSlug);
}
