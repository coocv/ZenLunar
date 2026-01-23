
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, Settings, Calendar as CalendarIcon, 
  Sparkles, RotateCcw, MapPin, Navigation, ChevronDown, 
  Briefcase, CalendarClock, Heart, Loader2, Download
} from 'lucide-react';
import { getCalendarMonthDays, formatDateFull } from './utils/calendarLogic';
import { getUserLocation, fetchWeather, getCityNameFromCoords } from './utils/weatherUtils';
import { DayCell } from './components/DayCell';
import { InsightModal } from './components/InsightModal';
import { CustomizationPanel } from './components/CustomizationPanel';
import { DayDetailSection } from './components/DayDetailSection';
import { WeatherEffects } from './components/WeatherEffects';
import { LocationSearchModal } from './components/LocationSearchModal';
import { WorkCycleSettingModal } from './components/WorkCycleSettingModal';
import { AnniversarySettingModal } from './components/AnniversarySettingModal';
import { RightSidebar } from './components/RightSidebar';
import { OnboardingTour } from './components/OnboardingTour';
import { InstallPwaGuide } from './components/InstallPwaGuide';
import { AppLogo } from './components/AppLogo';
import { WEEK_DAYS, WEEK_DAYS_CN, DEFAULT_THEME, SEASONAL_THEMES } from './constants';
import { CalendarDay, AppTheme, WeatherInfo, LocationData, WorkCycleConfig, Anniversary, AppBackupData } from './types';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState<CalendarDay[]>([]);
  
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const yearListRef = useRef<HTMLDivElement>(null);
  
  // Install Prompt State
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  
  // Robust Installation Detection State
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  
  // Detect iOS
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  // App Settings
  const [isDynamicTabEnabled, setIsDynamicTabEnabled] = useState(() => {
    try { return localStorage.getItem('zenlunar_dynamic_tab') === 'true'; } catch { return false; }
  });
  
  const [isLocating, setIsLocating] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [savedLocations, setSavedLocations] = useState<LocationData[]>(() => {
    try {
      const saved = localStorage.getItem('zenlunar_saved_locations');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [workCycleConfig, setWorkCycleConfig] = useState<WorkCycleConfig>(() => {
    try {
      const saved = localStorage.getItem('zenlunar_work_cycle');
      const parsed = saved ? JSON.parse(saved) : {};
      return { 
        cycleEnabled: parsed.cycleEnabled ?? false, 
        cycleMode: parsed.cycleMode || 'alternating',
        anchorDate: parsed.anchorDate || '', 
        anchorType: parsed.anchorType || 'big',
        exceptions: parsed.exceptions || {} 
      };
    } catch {
      return { cycleEnabled: false, cycleMode: 'alternating', anchorDate: '', anchorType: 'big', exceptions: {} };
    }
  });
  
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>(() => {
    try {
      const saved = localStorage.getItem('zenlunar_anniversaries');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [activeSettingsMode, setActiveSettingsMode] = useState<'cycle' | 'exception'>('cycle');
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherInfo>>({}); 
  const [savedLocationsWeather, setSavedLocationsWeather] = useState<Record<string, Record<string, WeatherInfo>>>({});
  const [locationError, setLocationError] = useState(false);
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(() => {
    try { return localStorage.getItem('zenlunar_animation') !== 'false'; } catch { return true; }
  });

  const [isCustomTheme, setIsCustomTheme] = useState(() => localStorage.getItem('zenlunar_is_custom_theme') === 'true');
  const [theme, setTheme] = useState<AppTheme>(() => {
      try {
          if (localStorage.getItem('zenlunar_is_custom_theme') === 'true') {
              const saved = localStorage.getItem('zenlunar_custom_theme_data');
              if (saved) return JSON.parse(saved);
          }
      } catch (e) {}
      return DEFAULT_THEME;
  });

  useEffect(() => { localStorage.setItem('zenlunar_animation', String(isAnimationEnabled)); }, [isAnimationEnabled]);
  useEffect(() => { localStorage.setItem('zenlunar_dynamic_tab', String(isDynamicTabEnabled)); }, [isDynamicTabEnabled]);
  useEffect(() => { localStorage.setItem('zenlunar_work_cycle', JSON.stringify(workCycleConfig)); }, [workCycleConfig]);
  useEffect(() => { localStorage.setItem('zenlunar_anniversaries', JSON.stringify(anniversaries)); }, [anniversaries]);
  useEffect(() => {
      localStorage.setItem('zenlunar_is_custom_theme', String(isCustomTheme));
      if (isCustomTheme) localStorage.setItem('zenlunar_custom_theme_data', JSON.stringify(theme));
  }, [theme, isCustomTheme]);

  // Install Prompt Listener
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Real-time Installation Status Check
  useEffect(() => {
    const checkInstallState = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true;
      setIsAppInstalled(isStandalone);
    };
    checkInstallState();
    window.addEventListener('appinstalled', () => {
       checkInstallState();
       setInstallPrompt(null);
    });
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const mqListener = (e: MediaQueryListEvent) => setIsAppInstalled(e.matches);
    if (mediaQuery.addEventListener) mediaQuery.addEventListener('change', mqListener);
    else mediaQuery.addListener(mqListener);
    return () => {
      window.removeEventListener('appinstalled', checkInstallState);
      if (mediaQuery.removeEventListener) mediaQuery.removeEventListener('change', mqListener);
      else mediaQuery.removeListener(mqListener);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

  const [isInsightOpen, setIsInsightOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWorkCycleOpen, setIsWorkCycleOpen] = useState(false);
  const [isAnniversaryOpen, setIsAnniversaryOpen] = useState(false);

  // === Dynamic Browser Tab & Favicon Logic ===
  useEffect(() => {
    const staticTitle = "ZenLunar 禅历";
    const staticIcon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNlNjAwMTIiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmYmJmMjQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgcng9IjEyOCIgZmlsbD0idXJsKCNnKSIvPjxwYXRoIGQ9Ik0xMjggMTcwaDI1NiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0OCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTEyOCAyNzZoMjU2IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjQ4IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1vcGFjaXR5PSIwLjYiLz48cGF0aCBkPSJNMTI4IDM4MmgxMjAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNDgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLW9wYWNpdHk9IjAuNiIvPjxjaXJjbGUgY3g9IjM1MCIgY3k9IjM4MiIgcj0iMzIiIGZpbGw9IndoaXRlIi8+PC9zdmc+";

    if (!isDynamicTabEnabled) {
      document.title = staticTitle;
      const existingIcons = document.querySelectorAll("link[rel*='icon']");
      existingIcons.forEach(el => el.remove());
      const link = document.createElement('link');
      link.type = 'image/svg+xml';
      link.rel = 'icon';
      link.href = staticIcon;
      document.head.appendChild(link);
      return;
    }

    const month = currentDate.getMonth() + 1;
    const date = currentDate.getDate();
    const dayIndex = (currentDate.getDay() + 6) % 7;
    const weekDay = WEEK_DAYS_CN[dayIndex];

    document.title = `${month}月${date}日 周${weekDay} • ZenLunar`;

    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${theme.colors.primary}"/><stop offset="100%" stop-color="${theme.colors.accent}"/></linearGradient></defs><rect width="100" height="100" rx="26" fill="url(#g)"/><rect x="20" y="24" width="60" height="56" rx="8" fill="white"/><circle cx="35" cy="20" r="5" fill="white" fill-opacity="0.9"/><circle cx="65" cy="20" r="5" fill="white" fill-opacity="0.9"/><text x="50" y="62" font-family="sans-serif" font-weight="bold" font-size="32" fill="${theme.colors.primary}" text-anchor="middle" dominant-baseline="middle">${date}</text></svg>`;
    const base64Svg = btoa(unescape(encodeURIComponent(svgIcon)));
    const dataUri = `data:image/svg+xml;base64,${base64Svg}`;

    const existingIcons = document.querySelectorAll("link[rel*='icon']");
    existingIcons.forEach(el => el.remove());
    const link = document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    link.href = dataUri;
    document.head.appendChild(link);
  }, [currentDate, theme.colors.primary, theme.colors.accent, isDynamicTabEnabled]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showYearPicker && yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) setShowYearPicker(false);
      if (showMonthPicker && monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) setShowMonthPicker(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showYearPicker, showMonthPicker]);
  
  useEffect(() => {
    if (showYearPicker && yearListRef.current) {
        const timer = setTimeout(() => {
            if (!yearListRef.current) return;
            const activeItem = yearListRef.current.querySelector('[data-active="true"]') as HTMLElement;
            if (activeItem) yearListRef.current.scrollTop = activeItem.offsetTop - (yearListRef.current.clientHeight / 2) + (activeItem.offsetHeight / 2);
        }, 10);
        return () => clearTimeout(timer);
    }
  }, [showYearPicker]);

  useEffect(() => {
    if (isCustomTheme) return;
    const month = currentDate.getMonth() + 1;
    let newTheme = DEFAULT_THEME;
    if (month >= 3 && month <= 5) newTheme = SEASONAL_THEMES.spring;
    else if (month >= 6 && month <= 8) newTheme = SEASONAL_THEMES.summer;
    else if (month >= 9 && month <= 11) newTheme = SEASONAL_THEMES.autumn;
    else newTheme = SEASONAL_THEMES.winter;
    setTheme(newTheme);
  }, [currentDate.getMonth(), isCustomTheme]);

  useEffect(() => {
    setDays(getCalendarMonthDays(currentDate.getFullYear(), currentDate.getMonth()));
  }, [currentDate.getFullYear(), currentDate.getMonth()]); 

  useEffect(() => {
    const initWeather = async () => {
      try {
        const cachedLoc = localStorage.getItem('zenlunar_last_location');
        if (cachedLoc) {
           const activeLoc = JSON.parse(cachedLoc);
           setCurrentLocation(activeLoc);
           const data = await fetchWeather(activeLoc.lat, activeLoc.lon);
           setWeatherMap(data);
           setLocationError(false);
           setIsLocating(false);
        } else { handleBackToGPS(); }
      } catch (e) { handleBackToGPS(); }
    };
    initWeather();
  }, []);

  const handleBackToGPS = async () => {
     setIsLocating(true);
     setLocationError(false);
     try {
        const { lat, lon } = await getUserLocation();
        const cityName = await getCityNameFromCoords(lat, lon);
        const newLoc = { id: 'current', name: cityName, lat, lon, isCurrent: true };
        localStorage.setItem('zenlunar_last_location', JSON.stringify(newLoc));
        setCurrentLocation(newLoc);
        const data = await fetchWeather(lat, lon);
        setWeatherMap(data);
     } catch (e) { 
        setLocationError(true); 
     } finally {
        setIsLocating(false);
     }
  };

  useEffect(() => { localStorage.setItem('zenlunar_saved_locations', JSON.stringify(savedLocations)); }, [savedLocations]);

  useEffect(() => {
    const fetchSavedWeather = async () => {
       if (savedLocations.length === 0) { setSavedLocationsWeather({}); return; }
       const promises = savedLocations.map(async (loc) => {
           try {
               const data = await fetchWeather(loc.lat, loc.lon);
               return { id: loc.id, data };
           } catch (e) { return { id: loc.id, data: null }; }
       });
       const results = await Promise.all(promises);
       setSavedLocationsWeather(prev => {
           const next = { ...prev };
           results.forEach(res => { if (res.data) next[res.id] = res.data; });
           return next;
       });
       if (currentLocation && !currentLocation.isCurrent) {
            const match = results.find(r => r.id === currentLocation.id);
            if (match && match.data) setWeatherMap(match.data);
       }
    };
    fetchSavedWeather();
  }, [savedLocations]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-text', theme.colors.text);
    document.body.style.backgroundColor = theme.colors.background;
  }, [theme]);

  const handlePrevMonth = () => {
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const targetDay = Math.min(currentDate.getDate(), new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).getDate());
    setCurrentDate(new Date(prevMonth.getFullYear(), prevMonth.getMonth(), targetDay));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const targetDay = Math.min(currentDate.getDate(), new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate());
    setCurrentDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), targetDay));
  };

  const handleDayClick = (day: CalendarDay) => setCurrentDate(day.date);
  const handleToday = () => setCurrentDate(new Date());

  const addLocation = (loc: LocationData) => {
    const existingIndex = savedLocations.findIndex(s => s.id === loc.id || s.name === loc.name);
    if (existingIndex >= 0) {
       if (window.confirm(`"${savedLocations[existingIndex].name}" 已存在，是否更新？`)) {
          setSavedLocations(prev => {
             const newList = [...prev];
             newList[existingIndex] = { ...loc, id: savedLocations[existingIndex].id }; 
             return newList;
          });
       }
    } else { setSavedLocations(prev => [...prev, loc]); }
  };

  const removeLocation = (id: string) => {
    setSavedLocations(prev => prev.filter(loc => loc.id !== id));
    if (currentLocation?.id === id) {
      handleBackToGPS();
    }
  };

  const handleLocationSwitch = async (loc: LocationData) => {
    localStorage.setItem('zenlunar_last_location', JSON.stringify(loc));
    setCurrentLocation(loc);
    const data = await fetchWeather(loc.lat, loc.lon);
    setWeatherMap(data);
  };

  const handleManualThemeChange = (newTheme: AppTheme) => {
    setTheme(newTheme);
    setIsCustomTheme(true);
  };

  const handleImportData = (data: AppBackupData) => {
    if (!data) return;
    if (window.confirm('确定导入配置吗？这将覆盖当前设置。')) {
        if (data.workCycle) setWorkCycleConfig(data.workCycle);
        if (data.anniversaries) setAnniversaries(data.anniversaries);
        if (data.savedLocations) setSavedLocations(data.savedLocations);
        if (data.theme) setTheme(data.theme);
        setIsCustomTheme(!!data.isCustomTheme);
        setIsAnimationEnabled(!!data.isAnimationEnabled);
        setIsDynamicTabEnabled(!!data.isDynamicTabEnabled);
        setIsPanelOpen(false);
    }
  };

  const fullConfig: AppBackupData = {
    version: 1,
    timestamp: Date.now(),
    workCycle: workCycleConfig,
    anniversaries: anniversaries,
    savedLocations: savedLocations,
    theme: theme,
    isCustomTheme: isCustomTheme,
    isAnimationEnabled: isAnimationEnabled,
    isDynamicTabEnabled: isDynamicTabEnabled
  };

  const currentDayObject = days.find(d => d.date.toDateString() === currentDate.toDateString()) || null;
  const isTodaySelected = new Date().toDateString() === currentDate.toDateString();
  const offset = currentDate.getTimezoneOffset() * 60000;
  const dateKey = new Date(currentDate.getTime() - offset).toISOString().split('T')[0];
  const selectedWeather = weatherMap[dateKey] || null;

  return (
    <div className="min-h-screen text-text font-sans transition-colors duration-500 relative">
      <WeatherEffects season={theme.season} enabled={isAnimationEnabled} />
      <OnboardingTour />
      {showInstallGuide && <InstallPwaGuide onClose={() => setShowInstallGuide(false)} isIos={isIos} />}
      <RightSidebar currentDate={currentDate} />
      <nav className="bg-surface/90 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={handleToday}>
             <div className="transition-transform duration-300 group-hover:scale-110">
                <AppLogo size={42} />
             </div>
             <h1 className="text-xl font-serif font-bold tracking-tight text-gray-800 hidden sm:block">
              ZenLunar <span className="text-primary transition-colors duration-500">禅历</span>
             </h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {locationError && (
              <div className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-500 text-[10px] rounded-lg border border-red-100 animate-in fade-in zoom-in">
                <MapPin size={10} /> <span>无定位权限</span>
              </div>
            )}
            {!isAppInstalled && (
              <button 
                onClick={handleInstallClick} 
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-primary to-orange-500 text-white rounded-full shadow-md hover:shadow-lg hover:opacity-90 transition-all transform active:scale-95 animate-pulse" 
                title={isIos ? "安装应用" : "安装为应用"}
              >
                <Download size={16} />
                <span className="text-xs font-bold">安装App</span>
              </button>
            )}
            <button onClick={() => { setActiveSettingsMode('cycle'); setIsWorkCycleOpen(true); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 relative" title="工作循环">
               <Briefcase size={22} />
               {workCycleConfig.cycleEnabled && <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-white"></span>}
            </button>
            <button onClick={() => { setActiveSettingsMode('exception'); setIsWorkCycleOpen(true); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 relative" title="调休设置">
               <CalendarClock size={22} />
               {Object.keys(workCycleConfig.exceptions).length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>}
            </button>
            <button onClick={() => setIsAnniversaryOpen(true)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 relative" title="纪念日">
               <Heart size={22} />
               {anniversaries.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>}
            </button>
            <button onClick={() => setIsPanelOpen(true)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600" title="设置"><Settings size={22} /></button>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative z-20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-6">
           <div className="text-left flex-1 relative">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-2">
                <h2 className="text-4xl sm:text-6xl font-bold font-serif text-text tracking-tight">{currentDate.getDate()}</h2>
                <div className="flex items-center gap-2 relative">
                    <div className="relative" ref={yearDropdownRef}>
                      <button onClick={() => { setShowMonthPicker(false); setShowYearPicker(!showYearPicker); }} className="flex items-center gap-1 text-xl sm:text-2xl text-gray-800 font-bold hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-black/5">
                        {currentDate.getFullYear()}年<ChevronDown size={16} className={`transition-transform ${showYearPicker ? 'rotate-180' : ''}`} />
                      </button>
                      {showYearPicker && (
                        <div ref={yearListRef} className="absolute top-full left-0 mt-2 w-32 max-h-[200px] bg-surface rounded-xl shadow-2xl border border-gray-100 overflow-y-auto z-[100] animate-in fade-in zoom-in-95 duration-150 scrollbar-thin" style={{WebkitOverflowScrolling: 'touch'}}>
                           {Array.from({length: 201}, (_, i) => 1900 + i).map(y => (
                             <button key={y} data-active={y === currentDate.getFullYear()} onClick={() => { const d = new Date(currentDate); d.setFullYear(y); setCurrentDate(d); setShowYearPicker(false); }} className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 ${y === currentDate.getFullYear() ? 'bg-primary/10 text-primary' : 'text-gray-700'}`}>{y}年</button>
                           ))}
                        </div>
                      )}
                    </div>
                    <div className="relative" ref={monthDropdownRef}>
                      <button onClick={() => { setShowYearPicker(false); setShowMonthPicker(!showMonthPicker); }} className="flex items-center gap-1 text-xl sm:text-2xl text-gray-800 font-bold hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-black/5">
                         {currentDate.getMonth() + 1}月<ChevronDown size={16} className={`transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} />
                      </button>
                      {showMonthPicker && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-surface rounded-xl shadow-2xl border border-gray-100 p-2 z-[100] animate-in fade-in zoom-in-95 duration-150">
                           <div className="grid grid-cols-3 gap-1">
                             {Array.from({length: 12}, (_, i) => i).map(m => (
                               <button key={m} onClick={() => { const d = new Date(currentDate); d.setMonth(m); setCurrentDate(d); setShowMonthPicker(false); }} className={`px-2 py-3 rounded-lg text-sm font-medium ${m === currentDate.getMonth() ? 'bg-primary text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}>{m + 1}月</button>
                             ))}
                           </div>
                        </div>
                      )}
                    </div>
                </div>
                <span className="text-lg sm:text-xl text-primary font-bold">/ 星期{WEEK_DAYS_CN[(currentDate.getDay() + 6) % 7]}</span>
              </div>
              <div className="h-px bg-gray-200 w-full mb-3"></div>
              <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4">
                  <p className="text-lg sm:text-2xl text-primary font-medium font-serif">{currentDayObject?.lunarYear}年 • {currentDayObject?.lunarMonth}{currentDayObject?.lunarDay}</p>
                  <span className="text-sm text-gray-400 font-sans">{formatDateFull(currentDate)}</span>
              </div>
           </div>
           <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full lg:w-auto relative z-10">
               <button onClick={() => setIsInsightOpen(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-orange-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 transition-all transform hover:-translate-y-0.5">
                  <Sparkles size={18} /><span>揭示运势</span>
               </button>
               <div className="flex items-center gap-2">
                   {!isTodaySelected && (
                       <button onClick={handleToday} className="h-full px-4 py-2 bg-surface border border-gray-100 shadow-sm rounded-xl text-sm font-medium hover:bg-gray-50 text-primary flex items-center gap-1 transition-all">
                         <RotateCcw size={14} /><span className="hidden sm:inline">回今天</span>
                       </button>
                   )}
                   <div className="flex items-center bg-surface p-1 rounded-xl shadow-sm border border-gray-100">
                      <button onClick={handlePrevMonth} className="p-3 hover:bg-secondary text-text hover:text-primary rounded-lg transition-colors"><ChevronLeft size={20} /></button>
                      <div className="px-3 font-bold text-gray-700 text-sm w-28 text-center tabular-nums">{currentDate.getFullYear()}.{(currentDate.getMonth()+1).toString().padStart(2, '0')}</div>
                      <button onClick={handleNextMonth} className="p-3 hover:bg-secondary text-text hover:text-primary rounded-lg transition-colors"><ChevronRight size={20} /></button>
                   </div>
               </div>
           </div>
        </div>
        <div className="bg-surface/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative z-0">
          <div className="grid grid-cols-7 border-b border-gray-100 bg-secondary/30">
            {WEEK_DAYS_CN.map((dayCN, idx) => (
              <div key={idx} className="py-4 text-center">
                <span className="block text-lg font-bold text-gray-700">{dayCN}</span>
                <span className="block text-[10px] text-primary/60 mt-0.5 font-sans uppercase">{WEEK_DAYS[idx]}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 p-2 sm:p-4 gap-2 sm:gap-4">
            {days.map((day, idx) => (
              <DayCell key={`${day.date.toISOString()}-${idx}`} day={day} isSelected={day.date.toDateString() === currentDate.toDateString()} onClick={handleDayClick} workCycle={workCycleConfig} anniversaries={anniversaries} />
            ))}
          </div>
        </div>
        <DayDetailSection 
          day={currentDayObject} 
          currentLocation={currentLocation} 
          weather={selectedWeather} 
          onAddLocationClick={() => setIsSearchOpen(true)} 
          savedLocations={savedLocations} 
          savedLocationsWeather={savedLocationsWeather} 
          onRemoveLocation={removeLocation} 
          onSelectLocation={handleLocationSwitch}
          onRefreshLocation={handleBackToGPS}
          isLocating={isLocating}
          locationError={locationError}
        />
      </main>
      {isInsightOpen && <div className="fixed inset-0 z-[70]"><InsightModal day={currentDayObject} onClose={() => setIsInsightOpen(false)} /></div>}
      {isSearchOpen && <LocationSearchModal onClose={() => setIsSearchOpen(false)} onAddLocation={addLocation} />}
      {isWorkCycleOpen && <WorkCycleSettingModal config={workCycleConfig} mode={activeSettingsMode} onSave={setWorkCycleConfig} onClose={() => setIsWorkCycleOpen(false)} />}
      {isAnniversaryOpen && <AnniversarySettingModal anniversaries={anniversaries} onSave={setAnniversaries} onClose={() => setIsAnniversaryOpen(false)} />}
      <CustomizationPanel 
        currentTheme={theme} 
        onThemeChange={handleManualThemeChange} 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        isAnimationEnabled={isAnimationEnabled} 
        onToggleAnimation={setIsAnimationEnabled} 
        isDynamicTabEnabled={isDynamicTabEnabled}
        onToggleDynamicTab={setIsDynamicTabEnabled}
        fullConfig={fullConfig} 
        onImport={handleImportData} 
      />
    </div>
  );
}

export default App;
