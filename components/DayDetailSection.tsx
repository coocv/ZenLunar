import React, { useState, useEffect, useMemo } from 'react';
import { CalendarDay, WeatherInfo, LocationData } from '../types';
import { Flag, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog, Wind, Droplets, MapPin, PlusCircle, Trash2, Loader2, ArrowUp, ArrowDown, BookOpen, Sparkles, Star } from 'lucide-react';
import { ALMANAC_DEFINITIONS, FESTIVAL_DEFINITIONS } from '../constants';
import { getZodiac } from '../utils/calendarLogic';
import { getHoroscope } from '../services/geminiService';

interface DayDetailSectionProps {
  day: CalendarDay | null;
  weather: WeatherInfo | null;
  currentLocation: LocationData | null;
  onAddLocationClick: () => void;
  savedLocations: LocationData[];
  savedLocationsWeather: Record<string, Record<string, WeatherInfo>>; // Map ID -> Date -> Weather
  onRemoveLocation: (id: string) => void;
  onSelectLocation: (loc: LocationData) => void;
}

export const DayDetailSection: React.FC<DayDetailSectionProps> = ({ 
  day, 
  weather, 
  currentLocation, 
  onAddLocationClick,
  savedLocations,
  savedLocationsWeather,
  onRemoveLocation,
  onSelectLocation
}) => {
  const [selectedTerm, setSelectedTerm] = useState<{name: string, type: 'yi' | 'ji', explanation: string} | null>(null);
  
  // Zodiac State
  const [horoscopeTip, setHoroscopeTip] = useState<string | null>(null);
  const [loadingHoroscope, setLoadingHoroscope] = useState(false);

  // Reset local state when day changes
  useEffect(() => {
    setHoroscopeTip(null);
    setLoadingHoroscope(false);
    setSelectedTerm(null);
  }, [day]);

  // Derive explanations for all festivals and solar terms
  const festivalExplanations = useMemo(() => {
    if (!day) return [];
    const list: {name: string, desc: string}[] = [];

    // 1. Solar Term
    if (day.solarTerm && FESTIVAL_DEFINITIONS[day.solarTerm]) {
       list.push({ name: day.solarTerm, desc: FESTIVAL_DEFINITIONS[day.solarTerm] });
    }

    // 2. Festivals
    if (day.festivals && day.festivals.length > 0) {
       day.festivals.forEach(fest => {
          // Avoid duplicates (e.g. if Solar term name is same as festival)
          if (list.some(item => item.name === fest)) return;

          let desc = FESTIVAL_DEFINITIONS[fest];
          if (!desc) {
             // Fallback: Check if any key is part of the fest string
             const key = Object.keys(FESTIVAL_DEFINITIONS).find(k => fest.includes(k));
             if (key) desc = FESTIVAL_DEFINITIONS[key];
          }

          if (desc) {
             list.push({ name: fest, desc });
          }
       });
    }
    return list;
  }, [day]);

  const displayTags = day ? [
    ...(day.solarTerm ? [day.solarTerm] : []),
    ...day.festivals
  ] : [];

  if (!day) return null;

  const fullDateCN = day.date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    weekday: 'long' 
  });

  const dateKey = day.date.toISOString().split('T')[0];
  const zodiac = getZodiac(day.date);

  const getWeatherIcon = (type: string, size = 32) => {
    switch (type) {
      case 'sun': return <Sun className="text-orange-500 animate-spin-slow" size={size} />;
      case 'rain': return <CloudRain className="text-blue-500" size={size} />;
      case 'snow': return <CloudSnow className="text-blue-300" size={size} />;
      case 'storm': return <CloudLightning className="text-purple-500" size={size} />;
      case 'fog': return <CloudFog className="text-gray-400" size={size} />;
      default: return <Cloud className="text-gray-400" size={size} />;
    }
  };

  const handleTermClick = (term: string, type: 'yi' | 'ji') => {
    if (selectedTerm?.name === term && selectedTerm?.type === type) {
      // If clicking the same term, collapse it
      setSelectedTerm(null);
    } else {
      // Expand new term
      const explanation = ALMANAC_DEFINITIONS[term] || "暂无该术语的详细解释。";
      setSelectedTerm({ name: term, type, explanation });
    }
  };

  const handleFetchHoroscope = async () => {
    if (!day || horoscopeTip) return;
    setLoadingHoroscope(true);
    const tip = await getHoroscope(zodiac.name, day.date.toLocaleDateString());
    setHoroscopeTip(tip || "星象神秘，暂无解语。");
    setLoadingHoroscope(false);
  };

  const isWithinWeatherRange = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    
    // Supported range is roughly -15 to +15 days
    return diffDays >= -15 && diffDays <= 15;
  };

  const renderExplanationBox = (type: 'yi' | 'ji') => {
    const isActive = selectedTerm?.type === type;
    const isYi = type === 'yi';
    
    return (
      <div 
        className={`
          overflow-hidden transition-all duration-300 ease-out
          ${isActive ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}
        `}
      >
        {isActive && (
          <div className={`p-4 rounded-xl border relative ${isYi ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {/* Small arrow indicator */}
            <div className={`absolute -top-2 left-6 w-4 h-4 transform rotate-45 border-l border-t ${isYi ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}></div>
            
            <div className="flex items-start gap-3 relative z-10">
               <BookOpen size={20} className={`mt-0.5 flex-shrink-0 ${isYi ? 'text-green-600' : 'text-red-500'}`} />
               <div>
                 <div className="flex items-baseline gap-2 mb-1">
                   <h4 className="font-bold font-serif text-lg">{selectedTerm.name}</h4>
                   <button onClick={() => setSelectedTerm(null)} className="text-xs opacity-60 hover:opacity-100 underline">收起</button>
                 </div>
                 <p className="text-sm leading-relaxed opacity-90 font-medium">
                    {selectedTerm.explanation}
                 </p>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Safe Yi/Ji Arrays
  const yiList = Array.isArray(day.yi) ? day.yi : [];
  const jiList = Array.isArray(day.ji) ? day.ji : [];

  return (
    <div className="mt-6 space-y-6">
      <div className="bg-surface rounded-2xl shadow-lg border border-gray-100 p-6 animate-in slide-in-from-bottom-4 duration-500 relative">
        
        {/* Header Info */}
        <div className="flex flex-col md:flex-row md:items-start justify-between border-b border-gray-100 pb-4 mb-4 gap-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800 font-serif flex items-center gap-2">
              {fullDateCN}
            </h3>
            <p className="text-primary font-medium mt-1">
               农历 {day.lunarYear}年 {day.lunarMonth}{day.lunarDay} {day.solarTerm ? `• ${day.solarTerm}` : ''}
            </p>
            
            {/* Auto-expanded Festival Explanations */}
            {festivalExplanations.length > 0 && (
                <div className="mt-4 space-y-3">
                  {festivalExplanations.map((item, idx) => (
                    <div 
                        key={`${item.name}-${idx}`}
                        className="bg-gradient-to-r from-accent/10 to-primary/5 p-4 rounded-xl border border-accent/20 animate-in fade-in slide-in-from-top-2 duration-300 relative"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                       <div className="flex items-start gap-3">
                          <div className="p-2 bg-accent/20 rounded-full text-accent-700 mt-0.5 flex-shrink-0">
                             <Flag size={18} className="text-accent" />
                          </div>
                          <div>
                             <h4 className="font-bold text-gray-800 text-lg mb-1">{item.name}</h4>
                             <p className="text-sm text-gray-700 leading-relaxed font-serif">
                                {item.desc}
                             </p>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
            )}
          </div>

          {/* Combined Tags (Visual only now) */}
          {displayTags.length > 0 && (
             <div className="flex flex-wrap gap-2 justify-start md:justify-end max-w-full md:max-w-[40%] content-start">
               {displayTags.map((tag, i) => {
                 // De-duplicate if solar term is same name as festival
                 if (i > 0 && displayTags.indexOf(tag) < i) return null;
                 
                 return (
                   <span 
                     key={i} 
                     className="px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 bg-accent/10 text-accent border border-accent/20 cursor-default"
                   >
                     <Flag size={14} /> 
                     <span>{tag}</span>
                   </span>
                 );
               })}
             </div>
          )}
        </div>

        {/* Main Weather Section */}
        <div className="mb-6 space-y-4">
          {weather ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 shadow-inner relative overflow-hidden transition-all">
              
              {/* Top Row: Location + Actions */}
              <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-2 text-gray-700 font-bold bg-white/60 px-3 py-1.5 rounded-full text-sm backdrop-blur-sm border border-white/40 shadow-sm">
                     <MapPin size={14} className="text-primary" />
                     {currentLocation?.name || "未知"}
                  </div>

                  <button 
                    onClick={onAddLocationClick}
                    className="flex items-center gap-1.5 text-xs font-medium bg-white text-primary px-3 py-1.5 rounded-full shadow-sm hover:shadow hover:bg-primary hover:text-white transition-all border border-blue-100 z-10"
                    title="添加其它城市"
                  >
                    <PlusCircle size={14} />
                    添加城市
                  </button>
              </div>

              {/* Main Content Row */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                   {/* Icon + Main Temp */}
                   <div className="flex items-center gap-6">
                        <div className="bg-white p-4 rounded-full shadow-sm">
                           {getWeatherIcon(weather.iconType, 48)}
                        </div>
                        <div>
                          <div className="text-5xl font-bold text-gray-800 flex items-baseline gap-2 tracking-tight">
                            {weather.currentTemp !== undefined ? weather.currentTemp : weather.tempMax}°
                            <span className="text-xl font-medium text-gray-500 tracking-normal">
                              {weather.description}
                            </span>
                          </div>
                           {/* High/Low */}
                          <div className="text-sm text-gray-500 mt-1 flex gap-4 font-medium">
                             <span className="flex items-center gap-1"><ArrowUp size={14} className="text-red-400" /> {weather.tempMax}°</span>
                             <span className="flex items-center gap-1"><ArrowDown size={14} className="text-blue-400" /> {weather.tempMin}°</span>
                          </div>
                        </div>
                   </div>

                   {/* Details Grid */}
                   <div className="flex gap-4 sm:gap-8 bg-white/40 p-4 rounded-xl backdrop-blur-sm border border-white/50 w-full md:w-auto justify-center md:justify-end">
                      {weather.humidity !== undefined && (
                        <div className="flex flex-col items-center min-w-[60px]">
                           <span className="text-xs text-gray-500 mb-1 font-medium">湿度</span>
                           <div className="flex items-center gap-1.5 text-gray-700 font-bold text-lg">
                               <Droplets size={16} className="text-blue-400" />
                               {weather.humidity}%
                           </div>
                        </div>
                      )}
                      {weather.windSpeed !== undefined && (
                        <div className="flex flex-col items-center min-w-[60px]">
                           <span className="text-xs text-gray-500 mb-1 font-medium">风速</span>
                           <div className="flex items-center gap-1.5 text-gray-700 font-bold text-lg">
                               <Wind size={16} className="text-gray-400" />
                               {weather.windSpeed}
                           </div>
                        </div>
                      )}
                   </div>
              </div>
            </div>
          ) : (
             isWithinWeatherRange(day.date) ? (
                <div className="bg-gray-50 rounded-xl p-6 flex items-center justify-center border border-dashed border-gray-300">
                   <span className="text-gray-400 flex items-center gap-2 animate-pulse">
                     <Loader2 size={18} className="animate-spin" /> 正在获取天气信息...
                   </span>
                </div>
             ) : (
                <div className="bg-gray-50/50 rounded-xl p-6 flex items-center justify-center border border-dashed border-gray-200">
                   <span className="text-gray-400 text-sm">
                      暂无该日期的天气数据 (仅显示前后15天)
                   </span>
                </div>
             )
          )}

          {/* Saved Locations List */}
          {savedLocations.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 animate-in fade-in pt-2">
               {savedLocations.map(loc => {
                 // Get weather for this location on the SELECTED date
                 const locWeatherMap = savedLocationsWeather[loc.id];
                 const w = locWeatherMap ? (locWeatherMap[dateKey] || Object.values(locWeatherMap)[0]) : null;
                 
                 const isActive = currentLocation?.id === loc.id;
                 
                 return (
                   <div 
                     key={loc.id} 
                     onClick={() => onSelectLocation(loc)}
                     className={`
                        border rounded-xl p-3 flex items-center justify-between shadow-sm transition-all cursor-pointer group
                        ${isActive 
                          ? 'bg-primary/5 border-primary ring-1 ring-primary' 
                          : 'bg-white border-gray-100 hover:shadow-md hover:border-gray-200'}
                     `}
                   >
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-primary/10' : 'bg-gray-50 text-gray-500'}`}>
                            {w ? getWeatherIcon(w.iconType, 20) : <Loader2 size={20} className="animate-spin" />}
                         </div>
                         <div>
                            <div className={`font-bold text-sm ${isActive ? 'text-primary' : 'text-gray-800'}`}>
                              {loc.name}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              {w ? (
                                <>
                                  <span>{w.currentTemp ?? w.tempMax}°</span>
                                  <span>•</span>
                                  <span>{w.description}</span>
                                </>
                              ) : '加载中...'}
                            </div>
                         </div>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveLocation(loc.id);
                        }}
                        className="text-gray-300 hover:text-red-400 hover:bg-red-50 p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        title="删除"
                      >
                         <Trash2 size={14} />
                      </button>
                   </div>
                 );
               })}
            </div>
          )}
        </div>

        {/* Yi / Ji Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-6">
          {/* Yi (Good) */}
          <div className="flex flex-col gap-3">
             <div className="flex items-center gap-2 text-green-600 font-bold text-lg">
               <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                 <span className="font-serif">宜</span>
               </div>
               <span>今日所宜</span>
             </div>
             
             <div className="flex flex-wrap gap-2 pl-10">
               {yiList.length > 0 ? (
                 yiList.map((item, idx) => {
                   const isActive = selectedTerm?.name === item && selectedTerm.type === 'yi';
                   return (
                     <button 
                       key={idx} 
                       onClick={() => handleTermClick(item, 'yi')}
                       className={`
                         px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer border
                         ${isActive 
                           ? 'bg-green-600 text-white border-green-600 shadow-md transform scale-105' 
                           : 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100 hover:border-green-200'}
                       `}
                       title="点击查看解释"
                     >
                       {item}
                     </button>
                   );
                 })
               ) : (
                 <span className="text-gray-400 text-sm">诸事不宜</span>
               )}
             </div>
             
             {/* Expandable Box for Yi */}
             {renderExplanationBox('yi')}
          </div>

          {/* Ji (Bad) */}
          <div className="flex flex-col gap-3">
             <div className="flex items-center gap-2 text-red-500 font-bold text-lg">
               <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                 <span className="font-serif">忌</span>
               </div>
               <span>今日所忌</span>
             </div>
             
             <div className="flex flex-wrap gap-2 pl-10">
               {jiList.length > 0 ? (
                 jiList.map((item, idx) => {
                   const isActive = selectedTerm?.name === item && selectedTerm.type === 'ji';
                   return (
                     <button 
                       key={idx} 
                       onClick={() => handleTermClick(item, 'ji')}
                       className={`
                         px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer border
                         ${isActive 
                           ? 'bg-red-500 text-white border-red-500 shadow-md transform scale-105' 
                           : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100 hover:border-red-200'}
                       `}
                       title="点击查看解释"
                     >
                       {item}
                     </button>
                   );
                 })
               ) : (
                 <span className="text-gray-400 text-sm">诸事无忌</span>
               )}
             </div>

             {/* Expandable Box for Ji */}
             {renderExplanationBox('ji')}
          </div>
        </div>

      </div>

      {/* Zodiac / Horoscope Card (NEW Dynamic Colors) */}
      <div className={`bg-gradient-to-r ${zodiac.theme.gradient} rounded-2xl shadow-lg border ${zodiac.theme.border} p-6 flex flex-col sm:flex-row items-center justify-between gap-6 animate-in slide-in-from-bottom-8 duration-500 delay-100`}>
          <div className="flex items-center gap-4">
             <div className={`w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-4xl border ${zodiac.theme.border} ${zodiac.theme.iconColor}`}>
                {zodiac.icon}
             </div>
             <div>
                <h3 className={`text-lg font-bold ${zodiac.theme.textMain} flex items-center gap-2`}>
                   {zodiac.name} <span className={`text-xs font-normal ${zodiac.theme.textSub} bg-white/50 px-2 py-0.5 rounded-full`}>{zodiac.range}</span>
                </h3>
                <div className={`flex items-center gap-1 text-sm ${zodiac.theme.textSub} mt-1 opacity-80`}>
                   <Star size={14} className={`${zodiac.theme.starFill}`} />
                   <span>今日星象提示</span>
                </div>
             </div>
          </div>

          <div className="flex-1 w-full sm:w-auto text-center sm:text-right">
             {horoscopeTip ? (
                <div className={`bg-white/60 backdrop-blur-sm p-4 rounded-xl border ${zodiac.theme.border} shadow-sm animate-in fade-in zoom-in-95`}>
                   <p className={`${zodiac.theme.textMain} font-serif italic text-lg leading-relaxed`}>
                      "{horoscopeTip}"
                   </p>
                </div>
             ) : (
                <button 
                  onClick={handleFetchHoroscope}
                  disabled={loadingHoroscope}
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 bg-white ${zodiac.theme.button}`}
                >
                   {loadingHoroscope ? (
                     <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>解读中...</span>
                     </>
                   ) : (
                     <>
                        <Sparkles size={18} />
                        <span>获取{zodiac.name}今日运势</span>
                     </>
                   )}
                </button>
             )}
          </div>
      </div>
    </div>
  );
};