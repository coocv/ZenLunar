
import { CalendarDay } from '../types';
import { MOCK_LUNAR_DATA } from '../constants';
import * as LunarModule from 'lunar-javascript';

// === 1. Robust Library Import ===
// Try to find the Lunar class in various export locations
let Lunar: any = null;
try {
  // Check default export
  if ((LunarModule as any).default && (LunarModule as any).default.Lunar) {
    Lunar = (LunarModule as any).default.Lunar;
  } 
  // Check named export
  else if ((LunarModule as any).Lunar) {
    Lunar = (LunarModule as any).Lunar;
  }
  // Check if the module itself is the class (unlikely for this lib but possible in some bundlers)
  else if (typeof LunarModule === 'function' || (typeof LunarModule === 'object' && (LunarModule as any).fromDate)) {
    Lunar = LunarModule;
  }
} catch (e) {
  console.warn("Lunar module import error:", e);
}

// === 2. Solar Festivals Fallback (Gregorian) ===
// Used when Lunar library fails, so users still see common festivals
const SOLAR_FESTIVALS: Record<string, string[]> = {
  '1-1': ['元旦'],
  '2-14': ['情人节'],
  '3-8': ['妇女节'],
  '3-12': ['植树节'],
  '4-1': ['愚人节'],
  '5-1': ['劳动节'],
  '5-4': ['青年节'],
  '6-1': ['儿童节'],
  '7-1': ['建党节'],
  '8-1': ['建军节'],
  '9-10': ['教师节'],
  '10-1': ['国庆节'],
  '12-24': ['平安夜'],
  '12-25': ['圣诞节'],
};

// Custom Map for Folk Festivals that might be missing in the library
// Key format: "Month-Day" (Lunar)
const CUSTOM_FOLK_FESTIVALS: Record<string, string[]> = {
  '1-1': ['春节'],
  '1-2': [], 
  '1-3': [], 
  '1-4': ['接神日', '隔开日'],
  '1-5': ['破五', '迎财神'],
  '1-6': ['送穷'],
  '1-7': ['人日'],
  '1-8': ['谷日', '顺星节'],
  '1-9': ['天日', '天公生'],
  '1-10': ['地日', '石头节'],
  '1-12': [], 
  '1-13': ['杨公忌'],
  '1-15': ['元宵节'],
  '1-20': ['天穿节'],
  '1-25': ['填仓节'],
  '2-1': ['中和节'],
  '2-2': ['龙抬头'],
  '3-3': ['上巳节'],
  '6-6': ['天贶节', '晒书节'],
  '7-7': ['七夕节'],
  '10-1': ['寒衣节'],
  '12-8': ['腊八节'],
  '12-16': ['尾牙'],
  '12-23': ['祭灶', '小年'], 
  // Removed '12-24': ['祭灶'] to avoid duplication/confusion as per user request
};

const isSameDate = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

export const getCalendarMonthDays = (year: number, month: number): CalendarDay[] => {
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  let startDayOfWeek = firstDayOfMonth.getDay(); 
  let mondayBasedStart = (startDayOfWeek + 6) % 7;

  const days: CalendarDay[] = [];

  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = mondayBasedStart - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthDays - i);
    days.push(createCalendarDay(date, false));
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push(createCalendarDay(date, true));
  }

  const remainingSlots = 42 - days.length; 
  for (let i = 1; i <= remainingSlots; i++) {
    const date = new Date(year, month + 1, i);
    days.push(createCalendarDay(date, false));
  }

  return days;
};

const createCalendarDay = (date: Date, isCurrentMonth: boolean): CalendarDay => {
  let lunarDayStr = '';
  let lunarMonthStr = '';
  let lunarYearStr = '';
  let solarTerm = '';
  let festivals: string[] = [];
  let yi: string[] = [];
  let ji: string[] = [];
  
  const festivalSet = new Set<string>();

  // Flag to track if library worked
  let libSuccess = false;
  let lunarObj: any = null;

  try {
    // Ensure Lunar is usable
    if (Lunar && typeof Lunar.fromDate === 'function') {
      const lunar = Lunar.fromDate(date);
      lunarObj = lunar;
      libSuccess = true;

      lunarDayStr = typeof lunar.getDayInChinese === 'function' ? lunar.getDayInChinese() : '';
      
      // Defensive check for isLeap
      let isLeap = false;
      if (typeof lunar.isLeap === 'function') {
         isLeap = lunar.isLeap();
      } else if (typeof lunar.toString === 'function') {
         // Fallback: check string representation for '闰' (leap)
         const str = lunar.toString();
         if (str && str.indexOf('闰') > -1) {
             isLeap = true;
         }
      }

      const monthCN = typeof lunar.getMonthInChinese === 'function' ? lunar.getMonthInChinese() : '';
      lunarMonthStr = (isLeap ? '闰' : '') + monthCN + '月';
      
      const yearGanZhi = typeof lunar.getYearInGanZhi === 'function' ? lunar.getYearInGanZhi() : '';
      const yearShengXiao = typeof lunar.getYearShengXiao === 'function' ? lunar.getYearShengXiao() : '';
      lunarYearStr = yearGanZhi + yearShengXiao;
      
      if (typeof lunar.getJieQi === 'function') {
        const jieQi = lunar.getJieQi();
        if (jieQi) solarTerm = jieQi;
      }
      
      // 1. Standard Festivals
      try {
        if (typeof lunar.getFestivals === 'function') {
           const trad = lunar.getFestivals();
           if (Array.isArray(trad)) trad.forEach((f: string) => festivalSet.add(f));
        }
      } catch (e) { /* ignore */ }

      // 2. Other Festivals
      try {
        // Some versions might not have this method
        if (typeof lunar.getOtherFestivals === 'function') {
           const other = lunar.getOtherFestivals();
           if (Array.isArray(other)) other.forEach((f: string) => festivalSet.add(f));
        }
      } catch (e) { /* ignore */ }
      
      // 3. Custom Folk Festivals Injection
      // Determine numeric month/day for lookup
      let lm = 0;
      let ld = 0;
      if (typeof lunar.getMonth === 'function') lm = lunar.getMonth();
      if (typeof lunar.getDay === 'function') ld = lunar.getDay();

      if (lm > 0 && ld > 0) {
         // Only inject folk festivals if not leap month
         if (!isLeap) { 
            const key = `${lm}-${ld}`;
            const customFests = CUSTOM_FOLK_FESTIVALS[key];
            if (customFests && Array.isArray(customFests)) {
               customFests.forEach(f => festivalSet.add(f));
            }
         }
      }
      
      // 4. Yi / Ji (Almanac)
      if (typeof lunar.getDayYi === 'function') {
         const dayYi = lunar.getDayYi();
         if (Array.isArray(dayYi)) yi = dayYi;
      }
      if (typeof lunar.getDayJi === 'function') {
         const dayJi = lunar.getDayJi();
         if (Array.isArray(dayJi)) ji = dayJi;
      }
    }
  } catch (e) {
    console.error("Lunar calculation failed for date:", date, e);
    libSuccess = false;
  }

  // === Fallback Logic if Library Failed ===
  if (!libSuccess) {
    const offset = Math.floor((date.getTime() - new Date(2023, 0, 22).getTime()) / 86400000);
    const mockIndex = Math.abs(offset) % 30;
    lunarDayStr = MOCK_LUNAR_DATA[mockIndex];
    lunarYearStr = "农历"; // Generic fallback
    
    // Default safe values for Yi/Ji to prevent UI breakage
    yi = ["诸事不宜"];
    ji = ["诸事勿取"];
  }
  
  // === Always Inject Solar Festivals (Gregorian) ===
  const solarKey = `${date.getMonth() + 1}-${date.getDate()}`;
  if (SOLAR_FESTIVALS[solarKey]) {
      SOLAR_FESTIVALS[solarKey].forEach(f => festivalSet.add(f));
  }

  // === Normalization & Filtering ===
  const normalizedFestivals = new Set<string>();
  festivalSet.forEach(f => {
    let name = f.trim();
    
    // Normalize variants
    if (name === '祭灶日') name = '祭灶';
    if (name === '接神日') name = '接神';
    if (name === '驱难日' || name === '驱傩日') name = '驱傩';
    if (name.includes('小年')) name = '小年'; // Unify "小年(北)" and "小年(南)"
    if (name === '龙头' || name === '龙头节') name = '龙抬头'; // Merge Dragon Head to unified name
    if (name === '隔开') name = '隔开日'; // Normalize

    // Logic: If user specifically wants "Ji Zao" only on 23rd (matching description)
    // we filter it out if it falls on 24th (which library might provide, or South China custom)
    // to prevent confusion of it appearing on two consecutive days.
    if (name === '祭灶' && lunarObj) {
        // Lunar-Javascript getMonth() returns lunar month (1-12)
        // getDay() returns lunar day (1-30)
        // Check if this is Lunar 12/24
        const m = lunarObj.getMonth();
        const d = lunarObj.getDay();
        if (m === 12 && d === 24) {
           return; // Skip adding '祭灶' on 24th
        }
    }

    // Logic: Ensure "隔开日" is strictly on Lunar 1-4
    if (name === '隔开日' && lunarObj) {
        const m = lunarObj.getMonth();
        const d = lunarObj.getDay();
        if (m !== 1 || d !== 4) {
            return; // Skip if not Jan 4th
        }
    }

    normalizedFestivals.add(name);
  });
  
  festivals = Array.from(normalizedFestivals);

  return {
    date,
    isCurrentMonth,
    isToday: isSameDate(date, new Date()),
    lunarDay: lunarDayStr || '初一',
    lunarMonth: lunarMonthStr,
    lunarYear: lunarYearStr,
    solarTerm,
    festivals,
    yi: yi.length > 0 ? yi : [],
    ji: ji.length > 0 ? ji : []
  };
};

export const formatDateFull = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const formatDateChinese = (date: Date): string => {
   return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(date);
};

export const getZodiac = (date: Date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const zodiacData = [
    { 
        name: "摩羯座", icon: "♑", startMonth: 12, startDay: 22, range: "12.22-1.19",
        theme: {
            gradient: "from-slate-50 via-gray-50 to-zinc-50",
            border: "border-slate-200",
            textMain: "text-slate-800",
            textSub: "text-slate-500",
            iconColor: "text-slate-700",
            button: "text-slate-700 hover:bg-slate-100 border-slate-200",
            starFill: "fill-slate-300 stroke-slate-400"
        }
    },
    { 
        name: "水瓶座", icon: "♒", startMonth: 1, startDay: 20, range: "1.20-2.18",
        theme: {
            gradient: "from-sky-50 via-cyan-50 to-blue-50",
            border: "border-sky-200",
            textMain: "text-sky-800",
            textSub: "text-sky-500",
            iconColor: "text-sky-600",
            button: "text-sky-700 hover:bg-sky-100 border-sky-200",
            starFill: "fill-sky-300 stroke-sky-400"
        }
    },
    { 
        name: "双鱼座", icon: "♓", startMonth: 2, startDay: 19, range: "2.19-3.20",
        theme: {
            gradient: "from-teal-50 via-cyan-50 to-emerald-50",
            border: "border-teal-200",
            textMain: "text-teal-800",
            textSub: "text-teal-500",
            iconColor: "text-teal-600",
            button: "text-teal-700 hover:bg-teal-100 border-teal-200",
            starFill: "fill-teal-300 stroke-teal-400"
        }
    },
    { 
        name: "白羊座", icon: "♈", startMonth: 3, startDay: 21, range: "3.21-4.19",
        theme: {
            gradient: "from-red-50 via-orange-50 to-rose-50",
            border: "border-red-200",
            textMain: "text-red-800",
            textSub: "text-red-500",
            iconColor: "text-red-600",
            button: "text-red-700 hover:bg-red-100 border-red-200",
            starFill: "fill-red-300 stroke-red-400"
        }
    },
    { 
        name: "金牛座", icon: "♉", startMonth: 4, startDay: 20, range: "4.20-5.20",
        theme: {
            gradient: "from-emerald-50 via-green-50 to-lime-50",
            border: "border-emerald-200",
            textMain: "text-emerald-800",
            textSub: "text-emerald-500",
            iconColor: "text-emerald-600",
            button: "text-emerald-700 hover:bg-emerald-100 border-emerald-200",
            starFill: "fill-emerald-300 stroke-emerald-400"
        }
    },
    { 
        name: "双子座", icon: "♊", startMonth: 5, startDay: 21, range: "5.21-6.21",
        theme: {
            gradient: "from-amber-50 via-yellow-50 to-orange-50",
            border: "border-amber-200",
            textMain: "text-amber-800",
            textSub: "text-amber-600",
            iconColor: "text-amber-600",
            button: "text-amber-800 hover:bg-amber-100 border-amber-200",
            starFill: "fill-amber-300 stroke-amber-400"
        }
    },
    { 
        name: "巨蟹座", icon: "♋", startMonth: 6, startDay: 22, range: "6.22-7.22",
        theme: {
            gradient: "from-blue-50 via-indigo-50 to-slate-50",
            border: "border-blue-200",
            textMain: "text-blue-800",
            textSub: "text-blue-500",
            iconColor: "text-blue-600",
            button: "text-blue-700 hover:bg-blue-100 border-blue-200",
            starFill: "fill-blue-300 stroke-blue-400"
        }
    },
    { 
        name: "狮子座", icon: "♌", startMonth: 7, startDay: 23, range: "7.23-8.22",
        theme: {
            gradient: "from-orange-50 via-amber-50 to-red-50",
            border: "border-orange-200",
            textMain: "text-orange-800",
            textSub: "text-orange-500",
            iconColor: "text-orange-600",
            button: "text-orange-700 hover:bg-orange-100 border-orange-200",
            starFill: "fill-orange-300 stroke-orange-400"
        }
    },
    { 
        name: "处女座", icon: "♍", startMonth: 8, startDay: 23, range: "8.23-9.22",
        theme: {
            gradient: "from-green-50 via-emerald-50 to-teal-50",
            border: "border-green-200",
            textMain: "text-green-800",
            textSub: "text-green-500",
            iconColor: "text-green-600",
            button: "text-green-700 hover:bg-green-100 border-green-200",
            starFill: "fill-green-300 stroke-green-400"
        }
    },
    { 
        name: "天秤座", icon: "♎", startMonth: 9, startDay: 23, range: "9.23-10.23",
        theme: {
            gradient: "from-pink-50 via-rose-50 to-fuchsia-50",
            border: "border-pink-200",
            textMain: "text-pink-800",
            textSub: "text-pink-500",
            iconColor: "text-pink-600",
            button: "text-pink-700 hover:bg-pink-100 border-pink-200",
            starFill: "fill-pink-300 stroke-pink-400"
        }
    },
    { 
        name: "天蝎座", icon: "♏", startMonth: 10, startDay: 24, range: "10.24-11.22",
        theme: {
            gradient: "from-purple-50 via-violet-50 to-fuchsia-50",
            border: "border-purple-200",
            textMain: "text-purple-900",
            textSub: "text-purple-500",
            iconColor: "text-purple-700",
            button: "text-purple-800 hover:bg-purple-100 border-purple-200",
            starFill: "fill-purple-300 stroke-purple-400"
        }
    },
    { 
        name: "射手座", icon: "♐", startMonth: 11, startDay: 23, range: "11.23-12.21",
        theme: {
            gradient: "from-indigo-50 via-violet-50 to-blue-50",
            border: "border-indigo-200",
            textMain: "text-indigo-900",
            textSub: "text-indigo-500",
            iconColor: "text-indigo-700",
            button: "text-indigo-700 hover:bg-indigo-100 border-indigo-200",
            starFill: "fill-indigo-300 stroke-indigo-400"
        }
    },
    { 
        name: "摩羯座", icon: "♑", startMonth: 12, startDay: 22, range: "12.22-1.19",
        theme: {
            gradient: "from-slate-50 via-gray-50 to-zinc-50",
            border: "border-slate-200",
            textMain: "text-slate-800",
            textSub: "text-slate-500",
            iconColor: "text-slate-700",
            button: "text-slate-700 hover:bg-slate-100 border-slate-200",
            starFill: "fill-slate-300 stroke-slate-400"
        }
    } 
  ];

  let sign = zodiacData[0];
  
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
     return zodiacData[12]; // Capricorn
  }

  for (let i = 0; i < zodiacData.length - 1; i++) {
      const curr = zodiacData[i];
      const next = zodiacData[i+1];
      if (month === curr.startMonth && day >= curr.startDay) {
          return curr;
      }
      if (month === (curr.startMonth % 12) + 1 && day < next.startDay) {
          return curr;
      }
  }

  return sign;
};
