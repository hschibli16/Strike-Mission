export type SwellComponent = {
  heightFt: string;
  heightM: string;
  periodSeconds: string;
  directionDegrees: string;
  directionLabel: string;
};

export type SurfConditions = {
  // Consensus wave data
  waveHeightFt: string | null;
  waveHeightM: string | null;
  wavePeriod: string | null;
  waveDirection: string | null;

  // Swell components
  primarySwell: SwellComponent | null;
  secondarySwell: SwellComponent | null;
  tertiarySwell: SwellComponent | null;

  // Wind
  windSpeedMph: string | null;
  windDirection: string | null;
  windDirectionLabel: string | null;

  // Sea conditions
  seaTempC: string | null;
  seaTempF: string | null;
  wetsuitRecommendation: string | null;

  // Quality analysis
  swellQuality: 'groundswell' | 'windswell' | 'mixed' | 'unknown';
  swellDirectionScore: number; // 0-100, how well swell direction aligns with spot
  windDirectionScore: number;  // 0-100, how well wind direction aligns with spot
  overallScore: number;        // 0-100
  verdict: string;             // plain English summary

  // Model data
  modelCount: number;
  confidenceScore: number;
  dataNote: string | null;
  modelBreakdown: {
    ecmwf: string | null;
    gfs: string | null;
    icon: string | null;
    windy: string | null;
  };

  // 10-day outlook
  outlook: DayOutlook[];
  bestDayThisWeek: DayOutlook | null;
  bestDayNextWeek: DayOutlook | null;
  swellEvents: SwellEvent[];

  updatedAt: string;
};

export type SkiConditions = {
  // Snow data
  freshSnow24h: string | null;  // cm
  freshSnow48h: string | null;
  freshSnow72h: string | null;
  forecastSnow7Day: string;     // cm total
  forecastSnow7DayIn: string;   // inches total
  snowDepthCm: string | null;
  snowDepthIn: string | null;

  // Temperature
  tempAtBaseF: string | null;
  tempAtBaseC: string | null;
  tempAtTopF: string | null;
  tempAtTopC: string | null;
  freezeLevelM: string | null;
  freezeLevelFt: string | null;

  // Wind
  windSpeedMph: string | null;
  windDescription: string | null;

  // Conditions analysis
  snowType: 'powder' | 'packed' | 'corn' | 'icy' | 'wet' | 'unknown';
  seasonType: 'peak' | 'early' | 'spring' | 'off' | 'summer';
  overallScore: number;
  verdict: string;

  // Model breakdown
  modelBreakdown: {
    icon: string | null;
    ecmwf: string | null;
    gfs: string | null;
  };
  confidenceScore: number;

  // Outlook
  outlook: SkiDayOutlook[];
  nextPowderDay: SkiDayOutlook | null;
  nextStormWindow: { start: string; end: string; totalCm: string } | null;

  // Resort specific
  chanceOfSnow: string | null;
  weatherDescription: string | null;

  updatedAt: string;
};

export type DayOutlook = {
  date: string;
  dayLabel: string; // 'Today', 'Tomorrow', 'Wed', etc
  waveHeightFt: string;
  waveHeightM: string;
  periodSeconds: string;
  directionDegrees: string;
  score: number;
  label: string;
  isBestDay?: boolean;
};

export type SkiDayOutlook = {
  date: string;
  dayLabel: string;
  snowfallCm: string;
  snowfallIn: string;
  tempHighF: string;
  tempLowF: string;
  snowType: string;
  description: string;
  score: number;
  isPowderDay?: boolean;
};

export type SwellEvent = {
  date: string;
  dayLabel: string;
  waveHeightFt: string;
  period: string;
  description: string;
  significance: 'epic' | 'solid' | 'moderate';
};
