
export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  lunarDay: string;
  lunarMonth: string;
  lunarYear: string; // e.g., 甲辰 (Dragon)
  solarTerm?: string; // e.g., Pure Brightness
  festivals: string[]; // Combined list of festivals
  yi: string[]; // Good for
  ji: string[]; // Bad for
}

export interface AppTheme {
  name: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter' | 'none';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    surface: string;
    text: string;
    background: string;
  };
}

export interface DailyInsight {
  date: string;
  fortune: string;
  history: string;
  luckyColor: string;
  luckyNumber: string;
}

export interface WeatherInfo {
  tempMax: number;
  tempMin: number;
  currentTemp?: number;
  code: number;
  description: string;
  humidity?: number;
  windSpeed?: number;
  iconType: 'sun' | 'cloud' | 'rain' | 'snow' | 'storm' | 'fog';
}

export interface LocationData {
  id: string;
  name: string;
  lat: number;
  lon: number;
  isCurrent: boolean;
}

export interface WorkCycleConfig {
  cycleEnabled: boolean;
  cycleMode: 'alternating' | 'single';
  anchorDate: string;
  anchorType: 'big' | 'small';
  exceptions: Record<string, 'work' | 'rest'>;
}

export interface Anniversary {
  id: string;
  date: string;
  name: string;
}

export enum ViewMode {
  Month = 'month',
  Year = 'year'
}

export interface AppBackupData {
  version: number;
  timestamp: number;
  workCycle: WorkCycleConfig;
  anniversaries: Anniversary[];
  savedLocations: LocationData[];
  theme: AppTheme;
  isCustomTheme: boolean;
  isAnimationEnabled: boolean;
  isDynamicTabEnabled?: boolean;
}
