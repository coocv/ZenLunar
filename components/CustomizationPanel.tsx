
import React, { useState, useRef } from 'react';
import { Palette, Wand2, Loader2, RefreshCw, Zap, Download, Upload, Save } from 'lucide-react';
import { AppTheme, AppBackupData } from '../types';
import { generateTheme } from '../services/geminiService';
import { DEFAULT_THEME } from '../constants';

interface CustomizationPanelProps {
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  isOpen: boolean;
  onClose: () => void;
  isAnimationEnabled: boolean;
  onToggleAnimation: (enabled: boolean) => void;
  fullConfig: AppBackupData;
  onImport: (data: AppBackupData) => void;
}

export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ 
  currentTheme, 
  onThemeChange, 
  isOpen,
  onClose,
  isAnimationEnabled,
  onToggleAnimation,
  fullConfig,
  onImport
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const theme = await generateTheme(prompt);
    if (theme) {
      onThemeChange(theme);
    }
    setLoading(false);
  };

  const handleReset = () => {
    onThemeChange(DEFAULT_THEME);
    setPrompt('');
  };

  const handleExport = () => {
      const dataStr = JSON.stringify(fullConfig, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `zenlunar_config_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (json) {
                  onImport(json);
              }
          } catch (err) {
              alert('配置文件格式错误');
          }
      };
      reader.readAsText(file);
      // Reset input value to allow re-importing same file if needed
      e.target.value = '';
  };

  return (
    <div className={`
      fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 z-40
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    `}>
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <Palette size={20} /> 个性化设置
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">关闭</button>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto pr-1">
          {/* Display Settings */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Zap size={16} className="text-primary" /> 显示设置
            </h4>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
               <div>
                  <div className="font-medium text-gray-800 text-sm">季节氛围动画</div>
                  <div className="text-xs text-gray-500 mt-1">
                     {isAnimationEnabled ? '开启 (飘雪、落叶等)' : '关闭 (仅静态背景)'}
                  </div>
               </div>
               <button 
                 onClick={() => onToggleAnimation(!isAnimationEnabled)}
                 className={`
                   relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                   ${isAnimationEnabled ? 'bg-primary' : 'bg-gray-300'}
                 `}
               >
                 <span
                   className={`
                     inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                     ${isAnimationEnabled ? 'translate-x-6' : 'translate-x-1'}
                   `}
                 />
               </button>
            </div>
          </div>

          <div className="h-px bg-gray-100 w-full"></div>

          {/* Data Management */}
          <div>
             <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
               <Save size={16} className="text-primary" /> 配置备份与恢复
             </h4>
             <div className="grid grid-cols-2 gap-3">
                <button 
                   onClick={handleExport}
                   className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-50 text-gray-700 font-medium text-sm border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all"
                >
                   <Download size={16} /> 导出配置
                </button>
                <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-50 text-gray-700 font-medium text-sm border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all"
                >
                   <Upload size={16} /> 导入配置
                </button>
                <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept=".json" 
                   onChange={handleFileChange}
                />
             </div>
             <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                包含：纪念日、工作制设置、已保存城市、当前主题与偏好。
             </p>
          </div>

          <div className="h-px bg-gray-100 w-full"></div>

          {/* AI Theme Generation */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              AI 主题生成
            </label>
            <p className="text-xs text-gray-500 mb-3">
              描述您想要的心情、季节或风格 (例如：“水墨山水”、“赛博朋克”、“极简禅意”)。
            </p>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm resize-none"
              rows={3}
              placeholder="输入您的主题灵感..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full py-3 bg-black text-white rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
            生成主题
          </button>

          <div className="border-t border-gray-100 pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">当前主题</h4>
            <div className="p-4 rounded-lg border border-gray-200 shadow-sm" style={{ backgroundColor: currentTheme.colors.background }}>
              <div className="font-bold mb-2" style={{ color: currentTheme.colors.text }}>{currentTheme.name}</div>
              <div className="flex gap-2">
                 <div className="w-8 h-8 rounded-full shadow-sm ring-1 ring-black/5" style={{ backgroundColor: currentTheme.colors.primary }} title="Primary"></div>
                 <div className="w-8 h-8 rounded-full shadow-sm ring-1 ring-black/5" style={{ backgroundColor: currentTheme.colors.secondary }} title="Secondary"></div>
                 <div className="w-8 h-8 rounded-full shadow-sm ring-1 ring-black/5" style={{ backgroundColor: currentTheme.colors.accent }} title="Accent"></div>
                 <div className="w-8 h-8 rounded-full shadow-sm border border-gray-200" style={{ backgroundColor: currentTheme.colors.surface }} title="Surface"></div>
              </div>
            </div>
            
             <button
              onClick={handleReset}
              className="mt-4 w-full py-2 border border-gray-200 text-gray-600 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-sm"
            >
              <RefreshCw size={14} />
              恢复默认 (自动季节)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
