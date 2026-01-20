
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Settings, Calendar as CalendarIcon, Sparkles, RotateCcw, MapPin, Navigation, ChevronDown, Briefcase, CalendarClock, Heart } from 'lucide-react';
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
import { WEEK_DAYS, WEEK_DAYS_CN, DEFAULT_THEME, SEASONAL_THEMES } from './constants';
import { CalendarDay, AppTheme, WeatherInfo, LocationData, WorkCycleConfig, Anniversary } from './types';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState<CalendarDay[]>([]);
  
  // Custom Dropdown State
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  
  // Refs for click outside detection
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  // Ref for auto-scrolling the year list
  const yearListRef = useRef<HTMLDivElement>(null);
  
  // Weather & Location State
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  
  // Load saved locations from LocalStorage
  const [savedLocations, setSavedLocations] = useState<LocationData[]>(() => {
    try {
      const saved = localStorage.getItem('zenlunar_saved_locations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Work Cycle State (Big/Small Week)
  const [workCycleConfig, setWorkCycleConfig] = useState<WorkCycleConfig>(() => {
    try {
      const saved = localStorage.getItem('zenlunar_work_cycle');
      const parsed = saved ? JSON.parse(saved) : {};
      
      // Migration logic for new structure
      return { 
        cycleEnabled: parsed.cycleEnabled ?? parsed.enabled ?? false, 
        cycleMode: parsed.cycleMode || 'alternating',
        anchorDate: parsed.anchorDate || '', 
        anchorType: parsed.anchorType || parsed.type || 'big',
        exceptions: parsed.exceptions || {} 
      };
    } catch {
      return { 
        cycleEnabled: false, 
        cycleMode: 'alternating', 
        anchorDate: '', 
        anchorType: 'big', 
        exceptions: {} 
      };
    }
  });
  
  // Anniversary State
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>(() => {
    try {
      const saved = localStorage.getItem('zenlunar_anniversaries');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // State to track which mode to open in the modal
  const [activeSettingsMode, setActiveSettingsMode] = useState<'cycle' | 'exception'>('cycle');

  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherInfo>>({}); 
  const [savedLocationsWeather, setSavedLocationsWeather] = useState<Record<string, Record<string, WeatherInfo>>>({});
  const [locationError, setLocationError] = useState(false);
  
  // Animation State
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(() => {
    try {
      return localStorage.getItem('zenlunar_animation') !== 'false';
    } catch { return true; }
  });

  useEffect(() => {
     localStorage.setItem('zenlunar_animation', String(isAnimationEnabled));
  }, [isAnimationEnabled]);

  useEffect(() => {
    localStorage.setItem('zenlunar_work_cycle', JSON.stringify(workCycleConfig));
  }, [workCycleConfig]);

  useEffect(() => {
    localStorage.setItem('zenlunar_anniversaries', JSON.stringify(anniversaries));
  }, [anniversaries]);

  // Modal State
  const [isInsightOpen, setIsInsightOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWorkCycleOpen, setIsWorkCycleOpen] = useState(false);
  const [isAnniversaryOpen, setIsAnniversaryOpen] = useState(false);
  
  const [theme, setTheme] = useState<AppTheme>(DEFAULT_THEME);

  // Click Outside Handler to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showYearPicker && yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setShowYearPicker(false);
      }
      if (showMonthPicker && monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setShowMonthPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showYearPicker, showMonthPicker]);
  
  // Auto-scroll year picker to current year
  useEffect(() => {
    if (showYearPicker && yearListRef.current) {
        // Use a small timeout to ensure the DOM is fully painted and layout is calculated
        const timer = setTimeout(() => {
            if (!yearListRef.current) return;
            const activeItem = yearListRef.current.querySelector('[data-active="true"]') as HTMLElement;
            if (activeItem) {
                const container = yearListRef.current;
                container.scrollTop = activeItem.offsetTop - (container.clientHeight / 2) + (activeItem.offsetHeight / 2);
            }
        }, 10);
        return () => clearTimeout(timer);
    }
  }, [showYearPicker]);

  // Detect Season on Month Change
  useEffect(() => {
    const month = currentDate.getMonth() + 1; // 1-12
    let newTheme = DEFAULT_THEME;

    if (month >= 3 && month <= 5) {
      newTheme = SEASONAL_THEMES.spring;
    } else if (month >= 6 && month <= 8) {
      newTheme = SEASONAL_THEMES.summer;
    } else if (month >= 9 && month <= 11) {
      newTheme = SEASONAL_THEMES.autumn;
    } else {
      newTheme = SEASONAL_THEMES.winter;
    }
    
    setTheme(newTheme);

  }, [currentDate.getMonth()]);

  useEffect(() => {
    const newDays = getCalendarMonthDays(currentDate.getFullYear(), currentDate.getMonth());
    setDays(newDays);
  }, [currentDate.getFullYear(), currentDate.getMonth()]); 

  // Init Main Weather (Current Location)
  useEffect(() => {
    const initWeather = async () => {
      let activeLoc: LocationData | null = null;
      try {
        const cachedLoc = localStorage.getItem('zenlunar_last_location');
        if (cachedLoc) {
           activeLoc = JSON.parse(cachedLoc);
        }
      } catch (e) { console.error("Error reading cached location", e); }

      if (activeLoc) {
         setCurrentLocation(activeLoc);
         try {
            const data = await fetchWeather(activeLoc.lat, activeLoc.lon);
            setWeatherMap(data);
            setLocationError(false);
         } catch (e) {
            console.error("Failed to fetch weather for cached location", e);
         }
      } else {
         handleBackToGPS();
      }
    };
    initWeather();
  }, []);

  const handleBackToGPS = async () => {
     try {
        const { lat, lon } = await getUserLocation();
        const cityName = await getCityNameFromCoords(lat, lon);
        
        const newLoc = {
           id: 'current',
           name: cityName,
           lat,
           lon,
           isCurrent: true
        };
        
        localStorage.setItem('zenlunar_last_location', JSON.stringify(newLoc));
        setCurrentLocation(newLoc);

        const data = await fetchWeather(lat, lon);
        setWeatherMap(data);
        setLocationError(false);
     } catch (e) {
        console.error("Failed to get location/weather", e);
        setLocationError(true);
     }
  };

  useEffect(() => {
     localStorage.setItem('zenlunar_saved_locations', JSON.stringify(savedLocations));
  }, [savedLocations]);

  useEffect(() => {
    const fetchSavedWeather = async () => {
       if (savedLocations.length === 0) {
           setSavedLocationsWeather({});
           return;
       }
       const promises = savedLocations.map(async (loc) => {
           try {
               const data = await fetchWeather(loc.lat, loc.lon);
               return { id: loc.id, data };
           } catch (e) {
               return { id: loc.id, data: null };
           }
       });

       const results = await Promise.all(promises);
       setSavedLocationsWeather(prev => {
           const next = { ...prev };
           results.forEach(res => {
               if (res.data) next[res.id] = res.data;
           });
           return next;
       });

       if (currentLocation && !currentLocation.isCurrent) {
            const match = results.find(r => r.id === currentLocation.id);
            if (match && match.data) {
                setWeatherMap(match.data);
            }
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
    const daysInPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).getDate();
    const targetDay = Math.min(currentDate.getDate(), daysInPrevMonth);
    setCurrentDate(new Date(prevMonth.getFullYear(), prevMonth.getMonth(), targetDay));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const daysInNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
    const targetDay = Math.min(currentDate.getDate(), daysInNextMonth);
    setCurrentDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), targetDay));
  };

  const selectYear = (year: number) => {
    const newDate = new Date(currentDate);
    if (newDate.getMonth() === 1 && newDate.getDate() === 29) {
        const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        if (!isLeap) newDate.setDate(28);
    }
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setShowYearPicker(false);
  };

  const selectMonth = (monthIndex: number) => {
    const newDate = new Date(currentDate);
    const year = newDate.getFullYear();
    const daysInTargetMonth = new Date(year, monthIndex + 1, 0).getDate();
    if (newDate.getDate() > daysInTargetMonth) {
        newDate.setDate(daysInTargetMonth);
    }
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    setShowMonthPicker(false);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: CalendarDay) => {
    setCurrentDate(day.date);
  };

  const openInsight = () => setIsInsightOpen(true);

  const addLocation = (loc: LocationData) => {
    const existingIndex = savedLocations.findIndex(s => s.id === loc.id || s.name === loc.name);
    if (existingIndex >= 0) {
       const existingLoc = savedLocations[existingIndex];
       if (window.confirm(`"${existingLoc.name}" 已存在于列表中，是否覆盖并更新天气？`)) {
          setSavedLocations(prev => {
             const newList = [...prev];
             newList[existingIndex] = { ...loc, id: existingLoc.id }; 
             return newList;
          });
       }
    } else {
      setSavedLocations(prev => [...prev, loc]);
    }
  };

  const removeLocation = (id: string) => {
    if (currentLocation?.id === id) handleBackToGPS();
    setSavedLocations(prev => prev.filter(l => l.id !== id));
  };

  const handleLocationSwitch = async (loc: LocationData) => {
     setCurrentLocation(loc);
     if (savedLocationsWeather[loc.id]) {
         setWeatherMap(savedLocationsWeather[loc.id]);
     } else {
         try {
             const data = await fetchWeather(loc.lat, loc.lon);
             setWeatherMap(data);
         } catch (e) { console.error("Failed to switch location weather", e); }
     }
     localStorage.setItem('zenlunar_last_location', JSON.stringify(loc));
  };

  const currentDayObject = days.find(d => 
    d.date.getDate() === currentDate.getDate() && 
    d.date.getMonth() === currentDate.getMonth() && 
    d.date.getFullYear() === currentDate.getFullYear()
  ) || null;

  const isTodaySelected = new Date().toDateString() === currentDate.toDateString();
  const offset = currentDate.getTimezoneOffset() * 60000;
  const localDate = new Date(currentDate.getTime() - offset);
  const dateKey = localDate.toISOString().split('T')[0];
  const selectedWeather = weatherMap[dateKey] || null;

  const yearsRange = Array.from({ length: 201 }, (_, i) => 1900 + i);
  const monthsRange = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="min-h-screen text-text font-sans transition-colors duration-500 relative">
      
      {/* Background Weather Animation */}
      <WeatherEffects season={theme.season} enabled={isAnimationEnabled} />

      {/* Top Bar */}
      <nav className="bg-surface/90 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleToday}>
            <div className="bg-primary text-white p-2 rounded-lg transition-colors duration-500">
               <CalendarIcon size={24} />
            </div>
            <h1 className="text-xl font-serif font-bold tracking-tight text-gray-800 hidden sm:block">
              ZenLunar <span className="text-primary transition-colors duration-500">禅历</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {locationError && (
              <span className="text-xs text-red-400 flex items-center gap-1">
                 <MapPin size={12} /> 定位失败
              </span>
            )}
            {currentLocation && currentLocation.id !== 'current' && (
                <button
                   onClick={handleBackToGPS}
                   className="p-2 hover:bg-gray-100 rounded-full text-primary transition-colors flex items-center gap-1"
                   title="定位当前位置"
                >
                   <Navigation size={20} />
                </button>
            )}
            
            {/* Cycle Settings Button */}
            <button
               onClick={() => {
                   setActiveSettingsMode('cycle');
                   setIsWorkCycleOpen(true);
               }}
               className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 relative"
               title="大小周/单休设置"
            >
               <Briefcase size={22} />
               {workCycleConfig.cycleEnabled && <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-white"></span>}
            </button>

            {/* Exceptions/Adjustments Button (Separate) */}
             <button
               onClick={() => {
                   setActiveSettingsMode('exception');
                   setIsWorkCycleOpen(true);
               }}
               className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 relative"
               title="特殊调休/例外设置"
            >
               <CalendarClock size={22} />
               {Object.keys(workCycleConfig.exceptions).length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>}
            </button>

            {/* Anniversary Button */}
             <button
               onClick={() => setIsAnniversaryOpen(true)}
               className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 relative"
               title="纪念日"
            >
               <Heart size={22} />
               {anniversaries.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>}
            </button>

            <button 
              onClick={() => setIsPanelOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
              title="个性化主题"
            >
              <Settings size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content - REMOVED 'relative z-10' to prevent stacking context trap for dropdowns */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative z-20">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-6">
           {/* Date Display */}
           <div className="text-left flex-1 relative">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-2">
                {/* Day Number */}
                <h2 className="text-4xl sm:text-6xl font-bold font-serif text-text tracking-tight">
                    {currentDate.getDate()}
                </h2>
                
                {/* Custom Year & Month Selectors */}
                <div className="flex items-center gap-2 relative">
                    
                    {/* Year Select */}
                    <div className="relative" ref={yearDropdownRef}>
                      <button 
                        onClick={() => {
                          setShowMonthPicker(false);
                          setShowYearPicker(!showYearPicker);
                        }}
                        className="flex items-center gap-1 text-xl sm:text-2xl text-gray-800 font-bold hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-black/5"
                      >
                        {currentDate.getFullYear()}年
                        <ChevronDown size={16} className={`transition-transform duration-200 ${showYearPicker ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown - High Z-Index */}
                      {showYearPicker && (
                        <div 
                          ref={yearListRef}
                          className="absolute top-full left-0 mt-2 w-32 max-h-[200px] bg-surface rounded-xl shadow-2xl border border-gray-100 overflow-y-auto z-[100] animate-in fade-in zoom-in-95 duration-150 scrollbar-thin"
                          style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                        >
                           {yearsRange.map(y => (
                             <button
                               key={y}
                               data-active={y === currentDate.getFullYear()}
                               onClick={() => selectYear(y)}
                               className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors ${y === currentDate.getFullYear() ? 'bg-primary/10 text-primary' : 'text-gray-700'}`}
                             >
                               {y}年
                             </button>
                           ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Month Select */}
                    <div className="relative" ref={monthDropdownRef}>
                      <button 
                        onClick={() => {
                          setShowYearPicker(false);
                          setShowMonthPicker(!showMonthPicker);
                        }}
                        className="flex items-center gap-1 text-xl sm:text-2xl text-gray-800 font-bold hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-black/5"
                      >
                         {currentDate.getMonth() + 1}月
                         <ChevronDown size={16} className={`transition-transform duration-200 ${showMonthPicker ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown (Grid) */}
                      {showMonthPicker && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-surface rounded-xl shadow-2xl border border-gray-100 p-2 z-[100] animate-in fade-in zoom-in-95 duration-150">
                           <div className="grid grid-cols-3 gap-1">
                             {monthsRange.map(m => (
                               <button
                                 key={m}
                                 onClick={() => selectMonth(m)}
                                 className={`px-2 py-3 rounded-lg text-sm font-medium transition-colors ${m === currentDate.getMonth() ? 'bg-primary text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}
                               >
                                 {m + 1}月
                               </button>
                             ))}
                           </div>
                        </div>
                      )}
                    </div>
                </div>

                <span className="text-lg sm:text-xl text-primary font-bold hidden sm:inline-block">
                    / 星期{WEEK_DAYS_CN[(currentDate.getDay() + 6) % 7]}
                </span>
                <span className="text-lg text-primary font-bold sm:hidden block mt-1">
                    星期{WEEK_DAYS_CN[(currentDate.getDay() + 6) % 7]}
                </span>
              </div>
              
              <div className="h-px bg-gray-200 w-full mb-3"></div>

              <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4">
                  <p className="text-lg sm:text-2xl text-primary font-medium font-serif">
                     {currentDayObject?.lunarYear}年 • {currentDayObject?.lunarMonth}{currentDayObject?.lunarDay}
                  </p>
                  <span className="text-sm text-gray-400 font-sans">
                     {formatDateFull(currentDate)}
                  </span>
              </div>
           </div>

           {/* Controls */}
           <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full lg:w-auto relative z-10">
               <button
                  onClick={openInsight}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-orange-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 transition-all transform hover:-translate-y-0.5"
               >
                  <Sparkles size={18} />
                  <span>揭示运势</span>
               </button>

               <div className="flex items-center gap-2">
                   {!isTodaySelected && (
                       <button 
                         onClick={handleToday}
                         className="h-full px-4 py-2 bg-surface border border-gray-100 shadow-sm rounded-xl text-sm font-medium hover:bg-gray-50 text-primary flex items-center gap-1 transition-all animate-in fade-in"
                         title="回到今天"
                       >
                         <RotateCcw size={14} />
                         <span className="hidden sm:inline">回今天</span>
                       </button>
                   )}
                   
                   <div className="flex items-center bg-surface p-1 rounded-xl shadow-sm border border-gray-100">
                      <button 
                        onClick={handlePrevMonth} 
                        className="p-3 hover:bg-secondary text-text hover:text-primary rounded-lg transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <div className="px-3 font-bold text-gray-700 text-sm w-28 text-center tabular-nums">
                         {currentDate.getFullYear()}.{(currentDate.getMonth()+1).toString().padStart(2, '0')}
                      </div>
                      <button 
                        onClick={handleNextMonth}
                        className="p-3 hover:bg-secondary text-text hover:text-primary rounded-lg transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                   </div>
               </div>
           </div>
        </div>

        {/* Calendar Grid */}
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
            {days.map((day, idx) => {
              const isSelected = day.date.toDateString() === currentDate.toDateString();
              return (
                <DayCell 
                    key={`${day.date.toISOString()}-${idx}`} 
                    day={day} 
                    isSelected={isSelected}
                    onClick={handleDayClick}
                    workCycle={workCycleConfig}
                    anniversaries={anniversaries}
                />
              );
            })}
          </div>
        </div>
        
        {/* Detail Section with Weather */}
        <DayDetailSection 
          day={currentDayObject} 
          currentLocation={currentLocation}
          weather={selectedWeather} 
          onAddLocationClick={() => setIsSearchOpen(true)}
          savedLocations={savedLocations}
          savedLocationsWeather={savedLocationsWeather}
          onRemoveLocation={removeLocation}
          onSelectLocation={handleLocationSwitch}
        />

      </main>

      {/* Modals & Panels */}
      {isInsightOpen && (
         <div className="fixed inset-0 z-[70]">
             <InsightModal day={currentDayObject} onClose={() => setIsInsightOpen(false)} />
         </div>
      )}

      {isSearchOpen && (
        <LocationSearchModal 
           onClose={() => setIsSearchOpen(false)} 
           onAddLocation={addLocation}
        />
      )}
      
      {isWorkCycleOpen && (
         <WorkCycleSettingModal 
            config={workCycleConfig}
            mode={activeSettingsMode}
            onSave={setWorkCycleConfig}
            onClose={() => setIsWorkCycleOpen(false)}
         />
      )}

      {isAnniversaryOpen && (
        <AnniversarySettingModal
          anniversaries={anniversaries}
          onSave={setAnniversaries}
          onClose={() => setIsAnniversaryOpen(false)}
        />
      )}
      
      <CustomizationPanel 
        currentTheme={theme}
        onThemeChange={setTheme}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        isAnimationEnabled={isAnimationEnabled}
        onToggleAnimation={setIsAnimationEnabled}
      />

    </div>
  );
}

export default App;
