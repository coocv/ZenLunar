
import React, { useState, useEffect } from 'react';
import { X, Briefcase, CalendarCheck, Info, ChevronLeft, ChevronRight, Check, CalendarClock } from 'lucide-react';
import { WorkCycleConfig } from '../types';
import { WEEK_DAYS_CN } from '../constants';

interface WorkCycleSettingModalProps {
  config: WorkCycleConfig;
  mode: 'cycle' | 'exception';
  onSave: (config: WorkCycleConfig) => void;
  onClose: () => void;
}

export const WorkCycleSettingModal: React.FC<WorkCycleSettingModalProps> = ({ config, mode, onSave, onClose }) => {
  // Animation State
  const [isVisible, setIsVisible] = useState(false);

  // Cycle Settings
  const [cycleEnabled, setCycleEnabled] = useState(config.cycleEnabled);
  const [cycleMode, setCycleMode] = useState<'alternating' | 'single'>(config.cycleMode || 'alternating');
  const [anchorDate, setAnchorDate] = useState(config.anchorDate || new Date().toISOString().split('T')[0]);
  const [anchorType, setAnchorType] = useState<'big' | 'small'>(config.anchorType);
  
  // Exception Settings
  const [exceptions, setExceptions] = useState<Record<string, 'work' | 'rest'>>(config.exceptions || {});
  
  // Custom Calendar State
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  const handleSave = () => {
    onSave({ cycleEnabled, cycleMode, anchorDate, anchorType, exceptions });
    handleClose();
  };

  const isSaturday = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getDay() === 6;
  };

  // === Exception Calendar Logic ===
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0-6 Sun-Sat
    const startOffset = (firstDay + 6) % 7; // Shift to Mon start
    
    const days = [];
    // Padding
    for (let i = 0; i < startOffset; i++) days.push(null);
    // Real days
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        // Correct timezone offset issue for ISO string
        const offset = d.getTimezoneOffset() * 60000;
        const local = new Date(d.getTime() - offset);
        days.push({ day: i, iso: local.toISOString().split('T')[0] });
    }
    return days;
  };

  const toggleDateSelection = (iso: string) => {
      const newSet = new Set(selectedDates);
      if (newSet.has(iso)) newSet.delete(iso);
      else newSet.add(iso);
      setSelectedDates(newSet);
  };

  const applyStatusToSelected = (status: 'work' | 'rest' | 'clear') => {
      const newExceptions = { ...exceptions };
      selectedDates.forEach(iso => {
          if (status === 'clear') {
              delete newExceptions[iso];
          } else {
              newExceptions[iso] = status;
          }
      });
      setExceptions(newExceptions);
      setSelectedDates(new Set()); // Clear selection after apply
  };

  const monthLabel = `${viewDate.getFullYear()}年${viewDate.getMonth() + 1}月`;
  const gridDays = getMonthDays(viewDate);

  return (
    <div 
        className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden relative flex flex-col max-h-[90vh] transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
           <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
             {mode === 'cycle' ? (
                <>
                  <Briefcase size={20} className="text-primary" />
                  工作循环设置
                </>
             ) : (
                <>
                  <CalendarClock size={20} className="text-primary" />
                  调休与例外设置
                </>
             )}
           </h3>
           <button onClick={handleClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
             <X size={18} />
           </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          
            {/* === MODE: CYCLE SETTINGS === */}
            {mode === 'cycle' && (
                <div className="space-y-6">
                     {/* Toggle */}
                     <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-gray-800">启用固定工作制</div>
                          <div className="text-xs text-gray-500 mt-1">如开启，周六/周日将按规则显示“班”或“休”</div>
                        </div>
                        <button 
                            onClick={() => setCycleEnabled(!cycleEnabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${cycleEnabled ? 'bg-primary' : 'bg-gray-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${cycleEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {cycleEnabled && (
                        <div className="space-y-5 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                             {/* Mode Selection */}
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">工作模式</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setCycleMode('alternating')}
                                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${cycleMode === 'alternating' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <CalendarCheck size={20} />
                                        <span className="font-bold">大小周 (交替)</span>
                                        <span className="text-xs opacity-70">单双周循环</span>
                                    </button>
                                    <button
                                        onClick={() => setCycleMode('single')}
                                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${cycleMode === 'single' ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <Briefcase size={20} />
                                        <span className="font-bold">单休 (做六休一)</span>
                                        <span className="text-xs opacity-70">每周六上班</span>
                                    </button>
                                </div>
                             </div>

                             {/* Alternating Config */}
                             {cycleMode === 'alternating' && (
                                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">选择基准日期 (建议选本周六)</label>
                                        <input 
                                        type="date" 
                                        value={anchorDate}
                                        onChange={(e) => setAnchorDate(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                        />
                                        {!isSaturday(anchorDate) && (
                                        <p className="text-xs text-orange-500 mt-1 font-medium">提示：建议选择一个周六作为基准。</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">该基准日期是？</label>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setAnchorType('small')}
                                                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${anchorType === 'small' ? 'bg-orange-100 border-orange-500 text-orange-800' : 'bg-white border-gray-200 text-gray-600'}`}
                                            >
                                                小周 (上班)
                                            </button>
                                            <button
                                                onClick={() => setAnchorType('big')}
                                                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${anchorType === 'big' ? 'bg-green-100 border-green-500 text-green-800' : 'bg-white border-gray-200 text-gray-600'}`}
                                            >
                                                大周 (休息)
                                            </button>
                                        </div>
                                    </div>
                                 </div>
                             )}
                        </div>
                    )}
                </div>
            )}

            {/* === MODE: EXCEPTIONS SETTINGS === */}
            {mode === 'exception' && (
                <div>
                        <div className="bg-orange-50 p-3 rounded-lg flex gap-2 text-sm text-orange-800 mb-4">
                        <Info size={16} className="flex-shrink-0 mt-0.5" />
                        <span>点击日历选择日期（可多选），然后设置状态。这里的设置优先级最高（覆盖法定节假日和大小周）。</span>
                    </div>

                    {/* Calendar Controls */}
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-1 hover:bg-gray-100 rounded">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="font-bold text-lg">{monthLabel}</span>
                        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-1 hover:bg-gray-100 rounded">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                        {WEEK_DAYS_CN.map(d => (
                            <div key={d} className="text-center text-xs text-gray-400 font-bold py-1">{d}</div>
                        ))}
                        {gridDays.map((item, i) => {
                            if (!item) return <div key={i}></div>;
                            const isSelected = selectedDates.has(item.iso);
                            const status = exceptions[item.iso];
                            
                            return (
                                <div 
                                    key={item.iso}
                                    onClick={() => toggleDateSelection(item.iso)}
                                    className={`
                                        aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer text-sm font-medium relative border transition-all
                                        ${isSelected 
                                            ? 'bg-primary text-white border-primary shadow-md transform scale-105 z-10' 
                                            : 'bg-white border-gray-100 hover:border-primary/50 text-gray-700'}
                                    `}
                                >
                                    <span>{item.day}</span>
                                    {/* Status Dot/Badge */}
                                    {status && !isSelected && (
                                        <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${status === 'work' ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                                    )}
                                    {status && isSelected && (
                                            <span className="absolute -top-1 -right-1 bg-white text-primary rounded-full p-0.5 shadow-sm">
                                                <Check size={8} strokeWidth={4} />
                                            </span>
                                    )}
                                    {/* Text label for status if space permits */}
                                    {status && !isSelected && (
                                        <span className={`absolute top-0.5 right-0.5 text-[8px] scale-75 font-bold ${status === 'work' ? 'text-orange-500' : 'text-green-500'}`}>
                                            {status === 'work' ? '班' : '休'}
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-2">
                            <button 
                            onClick={() => applyStatusToSelected('work')}
                            disabled={selectedDates.size === 0}
                            className="py-2 bg-orange-100 text-orange-700 rounded-lg font-bold text-sm hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                设为上班
                            </button>
                            <button 
                            onClick={() => applyStatusToSelected('rest')}
                            disabled={selectedDates.size === 0}
                            className="py-2 bg-green-100 text-green-700 rounded-lg font-bold text-sm hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                设为休息
                            </button>
                            <button 
                            onClick={() => applyStatusToSelected('clear')}
                            disabled={selectedDates.size === 0}
                            className="py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                清除状态
                            </button>
                    </div>
                    <div className="text-center mt-2 text-xs text-gray-400">
                            {selectedDates.size > 0 ? `已选中 ${selectedDates.size} 天` : '请点击日期进行选择'}
                    </div>
                </div>
            )}
            
          <div className="mt-6 pt-4 border-t border-gray-100">
            <button 
                onClick={handleSave}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
                保存全部设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
