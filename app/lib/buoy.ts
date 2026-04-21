export interface BuoyObservation {
  waveHeightM: number | null;
  waveHeightFt: number | null;
  periodS: number | null;
  directionDeg: number | null;
  waterTempC: number | null;
  observedAt: Date;
  ageMinutes: number;
  buoyId: string;
}

function parseField(value: string): number | null {
  if (value === 'MM' || value === '') return null;
  const n = parseFloat(value);
  return isNaN(n) ? null : n;
}

function parseRow(cols: string[]): {
  waveHeightM: number | null;
  dpd: number | null;
  apd: number | null;
  directionDeg: number | null;
  waterTempC: number | null;
  observedAt: Date;
} | null {
  // Columns: YY MM DD hh mm WDIR WSPD GST WVHT DPD APD MWD PRES ATMP WTMP ...
  // Index:    0  1  2  3  4   5    6    7   8    9   10  11  12   13   14
  if (cols.length < 15) return null;

  const [yy, mo, dd, hh, mm] = cols.slice(0, 5);
  const year = parseInt(yy, 10) < 100 ? 2000 + parseInt(yy, 10) : parseInt(yy, 10);
  const observedAt = new Date(Date.UTC(year, parseInt(mo, 10) - 1, parseInt(dd, 10), parseInt(hh, 10), parseInt(mm, 10)));
  if (isNaN(observedAt.getTime())) return null;

  return {
    waveHeightM: parseField(cols[8]),
    dpd: parseField(cols[9]),
    apd: parseField(cols[10]),
    directionDeg: parseField(cols[11]),
    waterTempC: parseField(cols[14]),
    observedAt,
  };
}

export async function fetchBuoyData(buoyId: string): Promise<BuoyObservation | null> {
  const url = `https://www.ndbc.noaa.gov/data/realtime2/${buoyId}.txt`;
  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return null;

    const text = await res.text();
    const lines = text.split('\n').filter(line => line.trim() !== '' && !line.startsWith('#'));

    if (lines.length === 0) return null;

    const now = new Date();
    const limit = Math.min(lines.length, 10);

    for (let i = 0; i < limit; i++) {
      const cols = lines[i].trim().split(/\s+/);
      const row = parseRow(cols);
      if (!row || row.waveHeightM === null) continue;

      const ageMinutes = Math.round((now.getTime() - row.observedAt.getTime()) / 60000);
      const periodS = row.dpd ?? row.apd;

      return {
        waveHeightM: row.waveHeightM,
        waveHeightFt: Math.round(row.waveHeightM * 3.28084 * 10) / 10,
        periodS,
        directionDeg: row.directionDeg,
        waterTempC: row.waterTempC,
        observedAt: row.observedAt,
        ageMinutes,
        buoyId,
      };
    }

    return null;
  } catch (err) {
    console.error(`[buoy] Failed to fetch buoy ${buoyId}:`, err);
    return null;
  }
}

export function formatBuoyAge(minutes: number): string {
  if (minutes < 15) return 'just now';
  if (minutes > 360) return 'stale';
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 120) return '1 hr ago';

  const totalHours = Math.floor(minutes / 60);
  const remainingMins = Math.round((minutes % 60) / 30) * 30;

  if (remainingMins === 0) return `${totalHours} hr ago`;
  if (remainingMins === 60) return `${totalHours + 1} hr ago`;
  return `${totalHours} hr ${remainingMins} min ago`;
}
