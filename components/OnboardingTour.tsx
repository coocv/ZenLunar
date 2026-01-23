
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Check, Sparkles, Calendar, NotebookPen, CloudSun, Settings2 } from 'lucide-react';

export const OnboardingTour: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('zenlunar_has_onboarded');
    if (!hasSeenTour) {
      // Delay slightly for a smoother entrance after app load
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    setIsOpen(false);
    localStorage.setItem('zenlunar_has_onboarded', 'true');
  };

  const steps = [
    {
      icon: <Sparkles size={48} className="text-primary" />,
      title: "欢迎来到 ZenLunar 禅历",
      desc: "传统与现代 AI 的优雅融合。在这里，您不仅可以查看精准的农历与节气，还能体验科技带来的生活指引。",
      color: "bg-primary/10"
    },
    {
      icon: <Calendar size={48} className="text-orange-500" />,
      title: "深度农历与节日",
      desc: "点击日历上的任意日期，即可查看详细的宜忌、黄历术语解释以及传统节日的文化起源。支持公历农历双向对照。",
      color: "bg-orange-50"
    },
    {
      icon: <NotebookPen size={48} className="text-purple-500" />,
      title: "随笔与日程助手",
      desc: "鼠标移至屏幕【右侧边缘】，即可唤出侧边栏。快速记录“今日日程”，或在“今日随笔”中写下您的感悟与心情，数据自动保存。",
      color: "bg-purple-50"
    },
    {
      icon: <CloudSun size={48} className="text-blue-500" />,
      title: "天气与 AI 运势",
      desc: "实时天气背景随季节流转。点击“揭示运势”按钮，让 AI 为您生成专属的每日指引、幸运色及历史上的今天。",
      color: "bg-blue-50"
    },
    {
      icon: <Settings2 size={48} className="text-gray-600" />,
      title: "高度个性化",
      desc: "点击顶部的设置图标，您可以管理倒班/大小周工作制、添加纪念日提醒，甚至让 AI 为您生成独一无二的主题配色。",
      color: "bg-gray-100"
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative flex flex-col min-h-[400px] animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        
        {/* Top Decoration */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary opacity-50"></div>

        {/* Close / Skip */}
        <button 
          onClick={handleComplete}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors text-xs font-medium"
        >
          跳过
        </button>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center mt-4">
           {/* Animated Icon Container */}
           <div className={`w-24 h-24 rounded-full ${steps[currentStep].color} flex items-center justify-center mb-6 transition-all duration-500 transform scale-100 shadow-inner`}>
              <div key={currentStep} className="animate-in zoom-in spin-in-12 duration-500">
                 {steps[currentStep].icon}
              </div>
           </div>

           <h2 key={`t-${currentStep}`} className="text-2xl font-serif font-bold text-gray-800 mb-3 animate-in slide-in-from-bottom-2 fade-in duration-500">
             {steps[currentStep].title}
           </h2>
           
           <p key={`d-${currentStep}`} className="text-gray-500 leading-relaxed text-sm animate-in slide-in-from-bottom-4 fade-in duration-500 delay-75">
             {steps[currentStep].desc}
           </p>
        </div>

        {/* Footer Navigation */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            {/* Dots */}
            <div className="flex gap-2">
              {steps.map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-primary w-6' : 'bg-gray-300'}`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
               {currentStep > 0 && (
                   <button 
                     onClick={() => setCurrentStep(prev => prev - 1)}
                     className="px-4 py-2 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors"
                   >
                     上一步
                   </button>
               )}
               
               <button 
                 onClick={() => {
                   if (currentStep < steps.length - 1) {
                     setCurrentStep(prev => prev + 1);
                   } else {
                     handleComplete();
                   }
                 }}
                 className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-opacity-90 transition-all flex items-center gap-2 transform active:scale-95"
               >
                 {currentStep < steps.length - 1 ? (
                   <>下一步 <ChevronRight size={16} /></>
                 ) : (
                   <>开启体验 <Check size={16} /></>
                 )}
               </button>
            </div>
        </div>
      </div>
    </div>
  );
};
