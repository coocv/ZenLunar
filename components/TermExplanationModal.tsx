import React from 'react';
import { X, BookOpen } from 'lucide-react';

interface TermExplanationModalProps {
  term: string;
  type: 'yi' | 'ji';
  explanation: string;
  onClose: () => void;
}

export const TermExplanationModal: React.FC<TermExplanationModalProps> = ({ term, type, explanation, onClose }) => {
  const isYi = type === 'yi';
  const colorClass = isYi ? 'text-green-600' : 'text-red-500';
  const bgClass = isYi ? 'bg-green-50' : 'bg-red-50';
  const borderClass = isYi ? 'border-green-200' : 'border-red-200';
  const iconBgClass = isYi ? 'bg-green-100' : 'bg-red-100';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 border-b ${borderClass} ${bgClass} flex justify-between items-center`}>
           <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${iconBgClass} flex items-center justify-center shadow-sm`}>
                 <span className={`font-serif font-bold text-lg ${colorClass}`}>
                    {isYi ? '宜' : '忌'}
                 </span>
              </div>
              <h3 className={`text-2xl font-bold font-serif text-gray-800`}>
                {term}
              </h3>
           </div>
           <button 
             onClick={onClose} 
             className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-gray-800"
           >
             <X size={18} />
           </button>
        </div>

        {/* Content */}
        <div className="p-6">
           <div className="flex items-start gap-3">
              <BookOpen size={20} className="text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  术语解释
                </h4>
                <p className="text-gray-700 text-lg leading-relaxed font-serif">
                  {explanation}
                </p>
              </div>
           </div>
           
           <div className="mt-6 text-center">
             <button 
               onClick={onClose}
               className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${isYi ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-500 text-white hover:bg-red-600'}`}
             >
               知道了
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};