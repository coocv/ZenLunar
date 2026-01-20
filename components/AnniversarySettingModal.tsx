
import React, { useState } from 'react';
import { X, Heart, Plus, Trash2 } from 'lucide-react';
import { Anniversary } from '../types';

interface AnniversarySettingModalProps {
  anniversaries: Anniversary[];
  onSave: (anniversaries: Anniversary[]) => void;
  onClose: () => void;
}

export const AnniversarySettingModal: React.FC<AnniversarySettingModalProps> = ({ anniversaries, onSave, onClose }) => {
  const [newMonth, setNewMonth] = useState(1);
  const [newDay, setNewDay] = useState(1);
  const [newName, setNewName] = useState('');

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  // Simple check for days in month (ignoring leap year logic for Feb 29 input UI for simplicity, 
  // though user can select 29 and it will just repeat on Mar 1 in non-leap years if not handled, 
  // but standard JS date will handle it or we assume 29. 
  // Let's stick to max 31 for UI and let user be responsible)
  const daysInMonth = (m: number) => {
      if ([4, 6, 9, 11].includes(m)) return 30;
      if (m === 2) return 29; // Allow 29 for inputs
      return 31;
  };
  
  const days = Array.from({ length: daysInMonth(newMonth) }, (_, i) => i + 1);

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
  };

  const handleDelete = (id: string) => {
    onSave(anniversaries.filter(a => a.id !== id));
  };

  // Sort anniversaries by date
  const sortedAnniversaries = [...anniversaries].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-rose-50 flex-shrink-0">
           <h3 className="font-bold text-rose-800 flex items-center gap-2 text-lg">
             <Heart size={20} className="fill-rose-500 text-rose-600" />
             纪念日管理
           </h3>
           <button onClick={onClose} className="p-2 hover:bg-rose-100 rounded-full transition-colors text-rose-800">
             <X size={18} />
           </button>
        </div>

        {/* Add Form */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 space-y-3">
           <div className="flex gap-2">
             <select 
                value={newMonth} 
                onChange={(e) => {
                    setNewMonth(Number(e.target.value));
                    setNewDay(1); // Reset day when month changes to avoid invalid dates
                }}
                className="p-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
             >
                {months.map(m => <option key={m} value={m}>{m}月</option>)}
             </select>
             <select 
                value={newDay} 
                onChange={(e) => setNewDay(Number(e.target.value))}
                className="p-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
             >
                {days.map(d => <option key={d} value={d}>{d}日</option>)}
             </select>
             <input 
                type="text" 
                placeholder="名称 (如: 生日)..." 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 p-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
             />
           </div>
           <button 
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
           >
              <Plus size={16} /> 添加纪念日
           </button>
        </div>

        {/* List */}
        <div className="p-2 overflow-y-auto flex-1 bg-white">
           {sortedAnniversaries.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                  <Heart size={32} className="opacity-20" />
                  <p className="text-sm">暂无纪念日，每年循环提醒</p>
               </div>
           ) : (
               <div className="space-y-2 p-2">
                  {sortedAnniversaries.map((ann) => (
                      <div key={ann.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-rose-100 hover:bg-rose-50/50 transition-colors group">
                          <div className="flex items-center gap-3">
                              <div className="bg-rose-100 text-rose-600 font-bold text-xs px-2 py-1 rounded">
                                 {ann.date.replace('-', '月')}日
                              </div>
                              <div className="font-medium text-gray-800">
                                 {ann.name}
                              </div>
                          </div>
                          <button 
                            onClick={() => handleDelete(ann.id)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                            title="删除"
                          >
                             <Trash2 size={16} />
                          </button>
                      </div>
                  ))}
               </div>
           )}
        </div>
      </div>
    </div>
  );
};
