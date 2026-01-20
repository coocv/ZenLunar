
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
  const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
  
  // Dynamic styles
  const opacityClass = day.isCurrentMonth ? 'opacity-100' : 'opacity-30';
  
  // Base classes
  let containerClasses = `
    relative h-24 sm:h-32 border rounded-lg p-2 flex flex-col justify-between 
    cursor-pointer transition-all duration-200 
    ${opacityClass}
  `;

  // Selection & Today logic
  if (isSelected) {
    containerClasses += ' ring-2 ring-primary ring-offset-2 bg-secondary/20 border-primary z-20';
  } else if (day.isToday) {
    containerClasses += ' border-primary/50 bg-surface shadow-sm hover:shadow-md z-10';
  } else {
    containerClasses += ' border-gray-100 hover:bg-gray-50 bg-surface hover:shadow-md';
  }
  
  const textColor = isWeekend || day.festivals.length > 0 ? 'text-primary' : 'text-text';

  // Logic: Show Month Name if day is '初一', otherwise show day
  const displayLunar = (day.lunarDay === '初一' && day.lunarMonth) ? day.lunarMonth : day.lunarDay;

  // Anniversary Check
  const monthStr = (day.date.getMonth() + 1).toString().padStart(2, '0');
  const dayStr = day.date.getDate().toString().padStart(2, '0');
  const dateKey = `${monthStr}-${dayStr}`;
  
  const todaysAnniversaries = anniversaries.filter(a => a.date === dateKey);

  // Work Cycle & Holiday Logic
  let workCycleBadge = null;

  // List of Statutory Holidays (Keywords) to auto-mark as Rest
  const STATUTORY_HOLIDAYS = ['春节', '元旦', '清明', '劳动节', '端午', '中秋', '国庆', '除夕'];
  const isStatutoryHoliday = day.festivals.some(f => STATUTORY_HOLIDAYS.some(h => f.includes(h)));
  
  if (workCycle) {
    // 1. Priority: Manual Exceptions (Correct Timezone Offset Handling for Key)
    const offset = day.date.getTimezoneOffset() * 60000;
    const localDate = new Date(day.date.getTime() - offset);
    const dateKeyFull = localDate.toISOString().split('T')[0];
    
    const exception = workCycle.exceptions ? workCycle.exceptions[dateKeyFull] : undefined;

    if (exception) {
        // Exception exists: Override everything
        if (exception === 'work') {
             workCycleBadge = (
              <span className="absolute top-1 left-1 bg-orange-100 text-orange-600 text-[10px] px-1 rounded font-bold border border-orange-200">
                  班
              </span>
            );
        } else {
             workCycleBadge = (
              <span className="absolute top-1 left-1 bg-green-100 text-green-600 text-[10px] px-1 rounded font-bold border border-green-200">
                  休
              </span>
            );
        }
    } 
    // 2. Priority: Statutory Holidays (If no exception)
    else if (isStatutoryHoliday) {
        workCycleBadge = (
            <span className="absolute top-1 left-1 bg-green-100 text-green-600 text-[10px] px-1 rounded font-bold border border-green-200">
                休
            </span>
        );
    } 
    // 3. Priority: Work Cycle (If enabled)
    else if (workCycle.cycleEnabled) {
        const dayOfWeek = day.date.getDay(); // 0 = Sun, 6 = Sat

        // Case 1: Single Mode (Single Day Off) -> Sat is Work, Sun is Rest
        if (workCycle.cycleMode === 'single') {
            if (dayOfWeek === 6) {
                 workCycleBadge = (
                    <span className="absolute top-1 left-1 bg-orange-100 text-orange-600 text-[10px] px-1 rounded font-bold border border-orange-200">
                        班
                    </span>
                );
            } else if (dayOfWeek === 0) {
                 workCycleBadge = (
                    <span className="absolute top-1 left-1 bg-green-100 text-green-600 text-[10px] px-1 rounded font-bold border border-green-200">
                        休
                    </span>
                );
            }
        } 
        // Case 2: Alternating Mode (Big/Small Week)
        else if (workCycle.cycleMode === 'alternating') {
             if (dayOfWeek === 6 && workCycle.anchorDate) {
                // 1. Get Anchor
                const anchor = new Date(workCycle.anchorDate);
                anchor.setHours(0,0,0,0);
                const current = new Date(day.date);
                current.setHours(0,0,0,0);

                // 2. Calculate difference in weeks
                const diffTime = current.getTime() - anchor.getTime();
                const diffWeeks = Math.round(diffTime / 604800000);

                // 3. Determine type
                const isSameType = diffWeeks % 2 === 0;
                
                let isWorkDay = false;

                if (workCycle.anchorType === 'small') {
                    // Anchor is Work (Small week)
                    isWorkDay = isSameType;
                } else {
                    // Anchor is Rest (Big week)
                    isWorkDay = !isSameType;
                }

                if (isWorkDay) {
                    workCycleBadge = (
                        <span className="absolute top-1 left-1 bg-orange-100 text-orange-600 text-[10px] px-1 rounded font-bold border border-orange-200">
                            班
                        </span>
                    );
                } else {
                    workCycleBadge = (
                        <span className="absolute top-1 left-1 bg-green-100 text-green-600 text-[10px] px-1 rounded font-bold border border-green-200">
                            休
                        </span>
                    );
                }
            } else if (dayOfWeek === 0) {
                // Sunday always rest in Alternating
                workCycleBadge = (
                    <span className="absolute top-1 left-1 bg-green-100 text-green-600 text-[10px] px-1 rounded font-bold border border-green-200">
                        休
                    </span>
                );
            }
        }
    }
  }

  return (
    <div 
      onClick={() => onClick(day)}
      className={containerClasses}
    >
      <div className="flex justify-between items-start">
        {workCycleBadge}
        <div className={`flex items-center gap-1 ${workCycleBadge ? 'ml-auto' : ''}`}>
           <span className={`text-lg sm:text-xl font-medium ${day.isToday ? 'text-primary font-bold' : textColor}`}>
             {day.date.getDate()}
           </span>
           {day.isToday && <span className="text-[10px] font-bold text-white bg-primary px-1.5 py-0.5 rounded-full">今</span>}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 overflow-hidden w-full">
        {/* Anniversaries */}
        {todaysAnniversaries.map((ann) => (
            <span key={ann.id} className="text-[10px] sm:text-xs bg-rose-100 text-rose-600 px-1 rounded truncate w-full text-right flex items-center justify-end gap-1 font-medium">
               <Heart size={8} fill="currentColor" /> {ann.name}
            </span>
        ))}

        {/* Festivals highlight */}
        {day.festivals.map((fest, idx) => (
          <span key={idx} className="text-[10px] sm:text-xs bg-accent text-white px-1 rounded truncate w-full text-right">
            {fest}
          </span>
        ))}
        
        {/* Solar Term */}
        {day.solarTerm && (
          <span className="text-[10px] sm:text-xs text-primary font-serif">
            {day.solarTerm}
          </span>
        )}

        {/* Lunar Date */}
        <span className={`text-xs sm:text-sm font-serif ${day.festivals.length > 0 ? 'text-primary font-bold' : 'text-gray-400'}`}>
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
