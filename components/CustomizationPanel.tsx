
import React, { useRef } from 'react';
import { Palette, RefreshCw, Zap, Download, Upload, Save } from 'lucide-react';
import { AppTheme, AppBackupData } from '../types';
import { DEFAULT_THEME } from '../constants';

interface CustomizationPanelProps {
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  isOpen: boolean;
  onClose: () => void;
  isAnimationEnabled: boolean;
  onToggleAnimation: (enabled: boolean) => void;
  isDynamicTabEnabled: boolean;
  onToggleDynamicTab: (enabled: boolean) => void;
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
  isDynamicTabEnabled,
  onToggleDynamicTab,
  fullConfig,
  onImport
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    onThemeChange(DEFAULT_THEME);
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
      e.target.value = '';
  };

  return (
    <>
      {/* Backdrop for click-outside close */}
      <div 
        className={`
          fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-500
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Panel */}
      <div className={`
        fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50
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
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
                <Zap size={16} className="text-primary" /> 显示与交互
              </h4>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                 <div>
                    <div className="font-medium text-gray-800 text-sm">季节氛围动画</div>
                    <div className="text-[10px] text-gray-500 mt-1">
                       开启后显示飘雪、落叶等动态特效
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

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                 <div>
                    <div className="font-medium text-gray-800 text-sm">动态标签页与图标</div>
                    <div className="text-[10px] text-gray-500 mt-1">
                       标题和图标随日期自动更新
                    </div>
                 </div>
                 <button 
                   onClick={() => onToggleDynamicTab(!isDynamicTabEnabled)}
                   className={`
                     relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                     ${isDynamicTabEnabled ? 'bg-primary' : 'bg-gray-300'}
                   `}
                 >
                   <span
                     className={`
                       inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                       ${isDynamicTabEnabled ? 'translate-x-6' : 'translate-x-1'}
                     `}
                   />
                 </button>
              </div>
            </div>

            <div className="h-px bg-gray-100 w-full"></div>

            {/* Current Theme Color */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">当前主题色</h4>
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
