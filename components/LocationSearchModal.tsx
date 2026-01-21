
import React, { useState, useEffect } from 'react';
import { X, Search, MapPin, Loader2, Plus } from 'lucide-react';
import { LocationData } from '../types';
import { searchCity } from '../utils/weatherUtils';

interface LocationSearchModalProps {
  onClose: () => void;
  onAddLocation: (location: LocationData) => void;
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({ onClose, onAddLocation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeOutId = setTimeout(async () => {
      if (query.trim().length >= 1) {
        setLoading(true);
        try {
           const cities = await searchCity(query);
           setResults(cities);
        } catch (e) {
           console.error("Search failed", e);
        } finally {
           setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 800);

    return () => clearTimeout(timeOutId);
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
           <h3 className="font-bold text-gray-800 flex items-center gap-2">
             <MapPin size={18} className="text-primary" /> 添加城市
           </h3>
           <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
             <X size={18} />
           </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
             {/* Use appearance-none and rounded properties to fix iOS default input styling */}
             <input 
               type="text" 
               inputMode="search"
               placeholder="输入城市或区县名称..." 
               className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-gray-50 transition-all appearance-none"
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               autoFocus
             />
             <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
             <div className="absolute right-2 top-2">
                {loading && <Loader2 size={20} className="animate-spin text-primary m-1.5" />}
             </div>
          </div>

          {/* Webkit scroll physics for iOS */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin" style={{ WebkitOverflowScrolling: 'touch' }}>
            {results.length === 0 && !loading && query.length > 1 && (
               <p className="text-center text-gray-400 text-sm py-4">未找到相关城市</p>
            )}
            
            {results.map((city) => (
              <button
                key={city.id}
                onClick={() => {
                   onAddLocation(city);
                   onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all text-left group"
              >
                <div className="flex items-center gap-3 w-full">
                   <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                      <MapPin size={16} />
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="font-bold text-gray-800 text-sm whitespace-normal leading-tight">{city.name}</div>
                     <div className="text-xs text-gray-400 mt-0.5">坐标: {city.lat.toFixed(2)}, {city.lon.toFixed(2)}</div>
                   </div>
                   <Plus size={18} className="text-gray-300 group-hover:text-primary flex-shrink-0" />
                </div>
              </button>
            ))}
            
            {results.length === 0 && !query && (
                <div className="text-center text-gray-400 text-sm py-8 flex flex-col items-center">
                    <Search size={32} className="mb-2 opacity-20" />
                    请输入城市名称
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
