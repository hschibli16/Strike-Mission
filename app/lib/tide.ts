export interface TideEvent {
  type: 'H' | 'L';
  time: Date;
  heightFt: number;
  minutesFromNow: number;
}

export interface TideObservation {
  stationId: string;
  stationName: string;
  currentHeightFt: number | null;
  observedAt: Date | null;
  ageMinutes: number | null;
  nextHigh: TideEvent | null;
  nextLow: TideEvent | null;
  trend: 'rising' | 'falling' | 'unknown';
  allEvents: TideEvent[];
}

const BASE = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';

function toYYYYMMDD(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

export async function fetchTideData(stationId: string): Promise<TideObservation | null> {
  if (!stationId) return null;

  try {
    const now = new Date();

    // Step 2 — Current water level
    const wlUrl = `${BASE}?product=water_level&station=${stationId}&date=latest&datum=MLLW&units=english&time_zone=gmt&format=json`;
    const wlRes = await fetch(wlUrl, { next: { revalidate: 600 } });
    if (!wlRes.ok) {
      console.error(`[tide] water_level fetch failed for ${stationId}: ${wlRes.status}`);
      return null;
    }
    const wlJson = await wlRes.json();

    let currentHeightFt: number | null = null;
    let observedAt: Date | null = null;
    let stationName = stationId;

    if (wlJson.metadata?.name) {
      stationName = wlJson.metadata.name;
    }
    if (wlJson.data?.[0]) {
      const raw = wlJson.data[0];
      const v = parseFloat(raw.v);
      if (!isNaN(v)) currentHeightFt = v;
      if (raw.t) {
        // NOAA returns "YYYY-MM-DD HH:MM" in UTC
        observedAt = new Date(raw.t.replace(' ', 'T') + 'Z');
      }
    }

    // Step 3 — Tide predictions (today + tomorrow)
    const today = toYYYYMMDD(now);
    const tomorrow = toYYYYMMDD(new Date(now.getTime() + 86400000));
    const predUrl = `${BASE}?product=predictions&station=${stationId}&begin_date=${today}&end_date=${tomorrow}&datum=MLLW&units=english&time_zone=gmt&interval=hilo&format=json`;
    const predRes = await fetch(predUrl, { next: { revalidate: 3600 } });
    if (!predRes.ok) {
      console.error(`[tide] predictions fetch failed for ${stationId}: ${predRes.status}`);
      return null;
    }
    const predJson = await predRes.json();

    if (!predJson.predictions || predJson.predictions.length === 0) {
      console.error(`[tide] no predictions for ${stationId}`);
      return null;
    }

    const allEvents: TideEvent[] = predJson.predictions.map((p: { t: string; v: string; type: string }) => {
      const time = new Date(p.t.replace(' ', 'T') + 'Z');
      const minutesFromNow = Math.round((time.getTime() - now.getTime()) / 60000);
      return {
        type: p.type as 'H' | 'L',
        time,
        heightFt: parseFloat(p.v),
        minutesFromNow,
      };
    });

    // Step 4 — Next high and low
    const nextHigh = allEvents.find(e => e.type === 'H' && e.minutesFromNow > 0) ?? null;
    const nextLow = allEvents.find(e => e.type === 'L' && e.minutesFromNow > 0) ?? null;

    // Step 5 — Trend
    let trend: 'rising' | 'falling' | 'unknown' = 'unknown';
    if (nextHigh && nextLow) {
      trend = nextHigh.minutesFromNow < nextLow.minutesFromNow ? 'rising' : 'falling';
    } else if (nextHigh) {
      trend = 'rising';
    } else if (nextLow) {
      trend = 'falling';
    }

    // Step 6 — Age
    const ageMinutes = observedAt
      ? Math.round((now.getTime() - observedAt.getTime()) / 60000)
      : null;

    return {
      stationId,
      stationName,
      currentHeightFt,
      observedAt,
      ageMinutes,
      nextHigh,
      nextLow,
      trend,
      allEvents,
    };
  } catch (err) {
    console.error(`[tide] error for ${stationId}:`, err);
    return null;
  }
}

export function formatTideTime(event: TideEvent): string {
  const m = event.minutesFromNow;
  if (m === 0) return 'now';
  const abs = Math.abs(m);
  const hrs = Math.floor(abs / 60);
  const mins = abs % 60;
  const parts = hrs > 0 ? `${hrs} hr${mins > 0 ? ` ${mins} min` : ''}` : `${mins} min`;
  return m > 0 ? `in ${parts}` : `${parts} ago`;
}

export function describeTideState(tide: TideObservation): string {
  const { nextHigh, nextLow, trend } = tide;

  // Check "near" a tide (within 30 min)
  if (nextHigh && Math.abs(nextHigh.minutesFromNow) <= 30) {
    return `Near high tide (${nextHigh.heightFt.toFixed(1)}ft)`;
  }
  if (nextLow && Math.abs(nextLow.minutesFromNow) <= 30) {
    return `Near low tide (${nextLow.heightFt.toFixed(1)}ft)`;
  }

  // Check "mid-tide": more than 2hr from both next and previous event
  const prevHigh = tide.allEvents.filter(e => e.type === 'H' && e.minutesFromNow <= 0).at(-1);
  const prevLow = tide.allEvents.filter(e => e.type === 'L' && e.minutesFromNow <= 0).at(-1);
  const nextMins = Math.min(nextHigh?.minutesFromNow ?? Infinity, nextLow?.minutesFromNow ?? Infinity);
  const prevMins = Math.max(
    prevHigh ? -prevHigh.minutesFromNow : -Infinity,
    prevLow ? -prevLow.minutesFromNow : -Infinity,
  );
  const isMidTide = nextMins > 120 && prevMins > 120;

  if (isMidTide) {
    return trend === 'rising' ? 'Mid-tide, rising' : trend === 'falling' ? 'Mid-tide, falling' : 'Mid-tide';
  }

  // Rising/falling with time to next event
  if (trend === 'rising' && nextHigh) {
    return `Rising toward high tide ${formatTideTime(nextHigh)}`;
  }
  if (trend === 'falling' && nextLow) {
    return `Falling toward low tide ${formatTideTime(nextLow)}`;
  }

  return trend === 'rising' ? 'Rising' : trend === 'falling' ? 'Falling' : 'Tide unknown';
}

export type TideState = 'LOW' | 'HIGH' | 'MID_RISING' | 'MID_FALLING' | 'UNKNOWN';

export function getTideState(tide: TideObservation): TideState {
  const nearest = tide.allEvents.reduce<TideEvent | null>((best, e) => {
    if (!best) return e;
    return Math.abs(e.minutesFromNow) < Math.abs(best.minutesFromNow) ? e : best;
  }, null);

  if (nearest && Math.abs(nearest.minutesFromNow) <= 45) {
    return nearest.type === 'H' ? 'HIGH' : 'LOW';
  }

  if (tide.trend === 'rising') return 'MID_RISING';
  if (tide.trend === 'falling') return 'MID_FALLING';
  return 'UNKNOWN';
}

export function tideStateLabel(state: TideState): string {
  switch (state) {
    case 'LOW':         return 'LOW TIDE';
    case 'HIGH':        return 'HIGH TIDE';
    case 'MID_RISING':  return 'MID-TIDE · RISING';
    case 'MID_FALLING': return 'MID-TIDE · FALLING';
    default:            return 'TIDE UNKNOWN';
  }
}
