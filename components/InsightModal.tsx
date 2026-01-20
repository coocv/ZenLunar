import React, { useEffect, useState } from 'react';
import { CalendarDay, DailyInsight } from '../types';
import { getDailyInsight } from '../services/geminiService';
import { X, Loader2, Sparkles, Scroll } from 'lucide-react';

interface InsightModalProps {
  day: CalendarDay | null;
  onClose: () => void;
}

export const InsightModal: React.FC<InsightModalProps> = ({ day, onClose }) => {
  const [insight, setInsight] = useState<DailyInsight | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (day) {
      setLoading(true);
      setInsight(null);
      const dateStr = day.date.toLocaleDateString();
      const lunarStr = `${day.lunarMonth}${day.lunarDay}`;
      
      getDailyInsight(dateStr, lunarStr)
        .then(data => {
          setInsight(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [day]);

  if (!day) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative border-t-4 border-primary animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 bg-secondary relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors text-text"
          >
            <X size={20} />
          </button>
          
          <h2 className="text-2xl font-serif text-primary font-bold flex items-center gap-2">
            {day.date.getDate()} <span className="text-lg font-normal text-text">{day.lunarMonth}{day.lunarDay}</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {day.lunarYear}年 • {day.date.toLocaleDateString('zh-CN', {weekday: 'long'})}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[250px] flex flex-col items-center justify-center text-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4 text-gray-400">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-sm animate-pulse">正在夜观天象...</p>
            </div>
          ) : insight ? (
            <div className="space-y-6 w-full text-left">
              
              <div className="bg-gradient-to-br from-secondary/50 to-white p-5 rounded-xl border border-red-50 shadow-sm">
                <div className="flex items-center gap-2 text-primary mb-3 font-bold text-xs uppercase tracking-widest">
                   <Sparkles size={14} /> 今日运势
                </div>
                <p className="text-xl font-serif italic text-gray-800 leading-relaxed">
                  "{insight.fortune}"
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-400 mb-2 font-bold text-xs uppercase tracking-widest">
                   <Scroll size={14} /> 历史上的今天
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {insight.history}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">幸运色</span>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border border-gray-200" style={{backgroundColor: insight.luckyColor.toLowerCase()}}></div>
                        <span className="font-bold text-text text-sm">{insight.luckyColor}</span>
                    </div>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">幸运数字</span>
                    <span className="font-bold text-text text-xl">{insight.luckyNumber}</span>
                </div>
              </div>

            </div>
          ) : (
             <div className="text-gray-400 text-sm">
                天机不可泄露... (请重试)
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
