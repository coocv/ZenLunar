
import React, { useState, useRef, useEffect } from 'react';
import { X, Heart, Plus, Trash2, ChevronDown, CalendarDays } from 'lucide-react';
import { Anniversary } from '../types';

interface AnniversarySettingModalProps {
  anniversaries: Anniversary[];
  onSave: (anniversaries: Anniversary[]) => void;
  onClose: () => void;
}

export const AnniversarySettingModal: React.FC<AnniversarySettingModalProps> = ({ anniversaries, onSave, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  const [newMonth, setNewMonth] = useState(new Date().getMonth() + 1);
  const [newDay, setNewDay] = useState(new Date().getDate());
  const [newName, setNewName] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState<'month' | 'day'>('month');

  const pickerRef = useRef<HTMLDivElement>(null);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = (m: number) => {
    if ([4, 6, 9, 11].includes(m)) return 30;
    if (m === 2) return 29;
    return 31;
  };
  
  const days = Array.from({ length: daysInMonth(newMonth) }, (_, i) => i + 1);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  // Auto-close picker on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    if (isPickerOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isPickerOpen]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    
    const dateStr = `${newMonth.toString().padStart(2, '0')}-${newDay.toString().padStart(2, '0')}`;
    const newAnniversary: Anniversary = {
      id: Date.now().toString(),
      date: dateStr,
      name: newName.trim()
    };
    
    onSave([...anniversaries, newAnniversary]);
    setNewName('');
    setIsPickerOpen(false);
  };

  const handleDelete = (id: string) => {
    onSave(anniversaries.filter(a => a.id !== id));
  };

  const sortedAnniversaries = [...anniversaries].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div 
        className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative flex flex-col max-h-[85vh] transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-rose-50/50 flex-shrink-0">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
                <Heart size={20} className="text-white fill-white" />
             </div>
             <div>
                <h3 className="font-bold text-gray-800 text-lg">纪念日管理</h3>
                <p className="text-[10px] text-rose-500 font-medium uppercase tracking-wider">Anniversary Reminders</p>
             </div>
           </div>
           <button onClick={handleClose} className="p-2 hover:bg-rose-100 rounded-full transition-colors text-rose-400">
             <X size={20} />
           </button>
        </div>

        {/* Add Form Area */}
        <div className="p-6 bg-white border-b border-gray-100 space-y-4">
           <div className="flex gap-3 relative">
             {/* Compact Date Trigger */}
             <div className="relative" ref={pickerRef}>
                <button 
                  onClick={() => setIsPickerOpen(!isPickerOpen)}
                  className={`
                    h-12 px-4 rounded-xl border flex items-center gap-2 transition-all whitespace-nowrap
                    ${isPickerOpen ? 'border-rose-500 ring-2 ring-rose-100 bg-rose-50/30' : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'}
                  `}
                >
                  <CalendarDays size={16} className={isPickerOpen ? 'text-rose-500' : 'text-gray-400'} />
                  <span className="text-sm font-bold text-gray-700">{newMonth}月{newDay}日</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isPickerOpen ? 'rotate-180 text-rose-500' : 'text-gray-300'}`} />
                </button>

                {/* Custom Compact Picker Popover */}
                {isPickerOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex gap-1 p-1 bg-gray-50 rounded-lg mb-4">
                      <button 
                        onClick={() => setPickerTab('month')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${pickerTab === 'month' ? 'bg-white text-rose-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        选择月份
                      </button>
                      <button 
                        onClick={() => setPickerTab('day')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${pickerTab === 'day' ? 'bg-white text-rose-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        选择日期
                      </button>
                    </div>

                    <div className="max-h-48 overflow-y-auto pr-1 scrollbar-none">
                      {pickerTab === 'month' ? (
                        <div className="grid grid-cols-4 gap-2">
                          {months.map(m => (
                            <button 
                              key={m} 
                              onClick={() => { setNewMonth(m); setNewDay(1); setPickerTab('day'); }}
                              className={`py-2 rounded-lg text-sm font-bold transition-all ${newMonth === m ? 'bg-rose-500 text-white shadow-md' : 'hover:bg-gray-100 text-gray-600'}`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-6 gap-2">
                          {days.map(d => (
                            <button 
                              key={d} 
                              onClick={() => { setNewDay(d); setIsPickerOpen(false); }}
                              className={`py-2 rounded-lg text-xs font-bold transition-all ${newDay === d ? 'bg-rose-500 text-white shadow-md' : 'hover:bg-gray-100 text-gray-600'}`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
             </div>

             <input 
                type="text" 
                placeholder="在此输入纪念日名称..." 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-400 bg-gray-50/50 transition-all text-sm font-medium"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
             />
           </div>
           
           <button 
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="w-full h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-30 disabled:shadow-none transition-all active:scale-95"
           >
              <Plus size={18} /> 确认添加
           </button>
        </div>

        {/* List Scroll Area */}
        <div className="p-3 overflow-y-auto flex-1 bg-gray-50/30">
           {sortedAnniversaries.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-16 text-gray-300 gap-4">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-inner">
                    <Heart size={32} className="opacity-10" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-400">暂无纪念日</p>
                    <p className="text-[10px] mt-1">设置后每年将在日历中优雅提醒</p>
                  </div>
               </div>
           ) : (
               <div className="space-y-2">
                  {sortedAnniversaries.map((ann) => (
                      <div key={ann.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 hover:border-rose-200 hover:shadow-md transition-all group">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-rose-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                                 <span className="text-[10px] text-rose-400 font-bold leading-none">{ann.date.split('-')[0]}月</span>
                                 <span className="text-sm text-rose-600 font-black">{ann.date.split('-')[1]}</span>
                              </div>
                              <div className="font-bold text-gray-700 truncate max-w-[180px]">
                                 {ann.name}
                              </div>
                          </div>
                          <button 
                            onClick={() => handleDelete(ann.id)}
                            className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                            title="删除"
                          >
                             <Trash2 size={16} />
                          </button>
                      </div>
                  ))}
               </div>
           )}
        </div>
        
        {/* Simple Footer */}
        <div className="p-4 bg-white border-t border-gray-50 text-center">
           <p className="text-[10px] text-gray-400 font-medium">✨ 数据已同步至本地存储</p>
        </div>
      </div>
    </div>
  );
};
