
import React from 'react';
import { CalendarDay, WorkCycleConfig, Anniversary } from '../types';
import { Sparkles, Heart } from 'lucide-react';

interface DayCellProps {
  day: CalendarDay;
  isSelected: boolean;
  onClick: (day: CalendarDay) => void;
  workCycle?: WorkCycleConfig;
  anniversaries?: Anniversary[];
}

export const DayCell: React.FC<DayCellProps> = ({ day, isSelected, onClick, workCycle, anniversaries = [] }) => {
  // Note: isWeekend and status are kept for Badge logic, but no longer affect text color.
  const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
  
  const STATUTORY_HOLIDAYS = ['春节', '元旦', '清明', '劳动节', '端午', '中秋', '国庆', '除夕'];
  const isStatutoryHoliday = day.festivals.some(f => STATUTORY_HOLIDAYS.some(h => f.includes(h)));

  let status: 'work' | 'rest' | null = null;
  
  if (workCycle) {
    // 1. Priority: Manual Exceptions
    const offset = day.date.getTimezoneOffset() * 60000;
    const localDate = new Date(day.date.getTime() - offset);
    const dateKeyFull = localDate.toISOString().split('T')[0];
    
    const exception = workCycle.exceptions ? workCycle.exceptions[dateKeyFull] : undefined;

    if (exception) {
        status = exception;
    } 
    // 2. Priority: Statutory Holidays
    else if (isStatutoryHoliday) {
        status = 'rest';
    } 
    // 3. Priority: Work Cycle
    else if (workCycle.cycleEnabled) {
        const dayOfWeek = day.date.getDay(); // 0 = Sun, 6 = Sat

        if (workCycle.cycleMode === 'single') {
            if (dayOfWeek === 6) status = 'work';
            else if (dayOfWeek === 0) status = 'rest';
        } 
        else if (workCycle.cycleMode === 'alternating') {
             if (dayOfWeek === 0) {
                 status = 'rest';
             } else if (dayOfWeek === 6 && workCycle.anchorDate) {
                const anchor = new Date(workCycle.anchorDate);
                anchor.setHours(0,0,0,0);
                const current = new Date(day.date);
                current.setHours(0,0,0,0);

                const diffTime = current.getTime() - anchor.getTime();
                const diffWeeks = Math.round(diffTime / 604800000);
                const isSameType = diffWeeks % 2 === 0;
                
                let isWorkDay = false;
                if (workCycle.anchorType === 'small') isWorkDay = isSameType;
                else isWorkDay = !isSameType;

                status = isWorkDay ? 'work' : 'rest';
            }
        }
    }
  }

  // Dynamic styles
  const opacityClass = day.isCurrentMonth ? 'opacity-100' : 'opacity-30';
  
  // Base classes
  let containerClasses = `
    relative h-24 sm:h-32 border rounded-lg p-2 flex flex-col justify-between 
    cursor-pointer transition-all duration-200 
    ${opacityClass}
  `;

  // Selection & Today logic (Container styling)
  if (isSelected) {
    containerClasses += ' ring-2 ring-primary ring-offset-2 bg-secondary/20 border-transparent z-20 shadow-[0_0_12px_var(--color-primary)]';
  } else if (day.isToday) {
    containerClasses += ' border-primary/50 bg-surface shadow-sm hover:shadow-md z-10';
  } else {
    containerClasses += ' border-gray-100 hover:bg-gray-50 bg-surface hover:shadow-md';
  }
  
  // Text Color Logic:
  // ONLY highlight the selected date number. All others (including Today if not selected, Weekends, Holidays) are standard text color.
  const dateTextColor = isSelected ? 'text-primary' : 'text-text';
  
  // Font Weight: Today is always bold for visibility, Selected is bold.
  const dateFontWeight = isSelected || day.isToday ? 'font-bold' : 'font-medium';

  // Secondary Text Color (Lunar Only): Keep as gray to differentiate hierarchy.
  const secondaryTextColor = 'text-gray-400';

  // Badge Logic
  let workCycleBadge = null;
  if (status === 'work') {
       workCycleBadge = (
        <span className="bg-orange-100 text-orange-600 text-[10px] px-1 rounded font-bold border border-orange-200">
            班
        </span>
      );
  } else if (status === 'rest') {
       workCycleBadge = (
        <span className="bg-green-100 text-green-600 text-[10px] px-1 rounded font-bold border border-green-200">
            休
        </span>
      );
  }

  // Logic: Show Month Name if day is '初一', otherwise show day
  const displayLunar = (day.lunarDay === '初一' && day.lunarMonth) ? day.lunarMonth : day.lunarDay;

  // Anniversary Check
  const monthStr = (day.date.getMonth() + 1).toString().padStart(2, '0');
  const dayStr = day.date.getDate().toString().padStart(2, '0');
  const dateKey = `${monthStr}-${dayStr}`;
  
  const todaysAnniversaries = anniversaries.filter(a => a.date === dateKey);

  return (
    <div 
      onClick={() => onClick(day)}
      className={containerClasses}
    >
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-1">
           <span className={`text-lg sm:text-xl ${dateFontWeight} ${dateTextColor}`}>
             {day.date.getDate()}
           </span>
           {day.isToday && <span className="text-[10px] font-bold text-white bg-primary px-1.5 py-0.5 rounded-full">今</span>}
        </div>
        {workCycleBadge}
      </div>

      <div className="flex flex-col items-end gap-1 overflow-hidden w-full">
        {/* Anniversaries */}
        {todaysAnniversaries.map((ann) => (
            <span key={ann.id} className="text-[10px] sm:text-xs bg-rose-100 text-rose-600 px-1 rounded truncate w-full text-right flex items-center justify-end gap-1 font-medium">
               <Heart size={8} fill="currentColor" /> {ann.name}
            </span>
        ))}

        {/* Festivals: Uses dateTextColor */}
        {day.festivals.map((fest, idx) => (
          <span key={idx} className={`text-[10px] sm:text-xs font-serif truncate w-full text-right ${dateTextColor}`}>
            {fest}
          </span>
        ))}
        
        {/* Solar Term: Also uses dateTextColor now, same as Festivals */}
        {day.solarTerm && (
          <span className={`text-[10px] sm:text-xs font-serif ${dateTextColor}`}>
            {day.solarTerm}
          </span>
        )}

        {/* Lunar Date: secondaryTextColor (Gray) */}
        <span className={`text-xs sm:text-sm font-serif ${secondaryTextColor}`}>
          {displayLunar}
        </span>
      </div>
      
      {isSelected && (
         <div className="absolute -bottom-1 -right-1">
            <Sparkles size={16} className="text-primary animate-pulse" />
         </div>
      )}
    </div>
  );
};
