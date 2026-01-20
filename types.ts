
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
  // Regular Cycle Settings
  cycleEnabled: boolean; // Toggle for the recurring pattern (Big/Small or Single)
  cycleMode: 'alternating' | 'single'; // 'alternating' = Big/Small Week, 'single' = Single Day Off (Work Sat)
  anchorDate: string; // ISO Date string of a reference Saturday (for alternating)
  anchorType: 'big' | 'small'; // 'big' = Reference date is Rest, 'small' = Reference date is Work

  // Exception Settings (Always applicable if defined)
  exceptions: Record<string, 'work' | 'rest'>; // Custom overrides: 'YYYY-MM-DD' -> status
}

export interface Anniversary {
  id: string;
  date: string; // Format: "MM-DD"
  name: string;
}

export enum ViewMode {
  Month = 'month',
  Year = 'year'
}
