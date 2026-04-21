import type { TideEvent, TideObservation } from '../lib/tide';

interface TideSparklineProps {
  tide: TideObservation;
  width?: number;
  height?: number;
}

// Catmull-Rom spline control point helper
function catmullRomCP(p0: [number, number], p1: [number, number], p2: [number, number], p3: [number, number]): [[number, number], [number, number]] {
  const t = 0.4;
  const cp1: [number, number] = [
    p1[0] + (p2[0] - p0[0]) * t,
    p1[1] + (p2[1] - p0[1]) * t,
  ];
  const cp2: [number, number] = [
    p2[0] - (p3[0] - p1[0]) * t,
    p2[1] - (p3[1] - p1[1]) * t,
  ];
  return [cp1, cp2];
}

export default function TideSparkline({ tide, width = 220, height = 48 }: TideSparklineProps) {
  const MIN_MINUTES = -480;  // 8 hrs ago
  const MAX_MINUTES = 960;   // 16 hrs ahead
  const NOW_MINUTES = 0;

  // Collect visible events within the window
  const visibleEvents: Array<{ minutesFromNow: number; heightFt: number; type?: 'H' | 'L' }> = tide.allEvents
    .filter(e => e.minutesFromNow >= MIN_MINUTES && e.minutesFromNow <= MAX_MINUTES)
    .map(e => ({ minutesFromNow: e.minutesFromNow, heightFt: e.heightFt, type: e.type }));

  // Inject the "now" point if we have current height
  if (tide.currentHeightFt !== null) {
    visibleEvents.push({ minutesFromNow: 0, heightFt: tide.currentHeightFt });
  }

  // Sort by time
  visibleEvents.sort((a, b) => a.minutesFromNow - b.minutesFromNow);

  if (visibleEvents.length < 2) return null;

  // Height bounds
  const heights = visibleEvents.map(e => e.heightFt);
  const minH = Math.min(...heights) - 0.5;
  const maxH = Math.max(...heights) + 0.5;

  // Mapping functions
  const xOf = (m: number) => ((m - MIN_MINUTES) / (MAX_MINUTES - MIN_MINUTES)) * width;
  const yOf = (h: number) => height - 4 - ((h - minH) / (maxH - minH)) * (height - 8);

  const pts: Array<[number, number]> = visibleEvents.map(e => [xOf(e.minutesFromNow), yOf(e.heightFt)]);

  // Build smooth SVG path using Catmull-Rom splines
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const [cp1, cp2] = catmullRomCP(p0, p1, p2, p3);
    d += ` C ${cp1[0].toFixed(1)} ${cp1[1].toFixed(1)}, ${cp2[0].toFixed(1)} ${cp2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }

  // Fill path: close down to bottom
  const fillD = `${d} L ${pts[pts.length - 1][0].toFixed(1)} ${height} L ${pts[0][0].toFixed(1)} ${height} Z`;

  // "Now" position
  const nowX = xOf(NOW_MINUTES);
  const nowY = tide.currentHeightFt !== null ? yOf(tide.currentHeightFt) : null;

  // Dot positions for H/L events
  const eventDots = visibleEvents.filter(e => e.type === 'H' || e.type === 'L');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Area fill under curve */}
      <path d={fillD} fill="#6b6560" fillOpacity={0.1} stroke="none" />

      {/* Tide curve */}
      <path d={d} fill="none" stroke="#6b6560" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots at H/L events */}
      {eventDots.map((e, i) => (
        <circle key={i} cx={xOf(e.minutesFromNow).toFixed(1)} cy={yOf(e.heightFt).toFixed(1)} r={2} fill="#6b6560" />
      ))}

      {/* "Now" vertical dashed line */}
      <line x1={nowX.toFixed(1)} y1={0} x2={nowX.toFixed(1)} y2={height} stroke="#fbbf24" strokeWidth={1} strokeDasharray="2 2" />

      {/* "Now" dot */}
      {nowY !== null && (
        <circle cx={nowX.toFixed(1)} cy={nowY.toFixed(1)} r={3} fill="#fbbf24" stroke="#0a0808" strokeWidth={1.5} />
      )}
    </svg>
  );
}
