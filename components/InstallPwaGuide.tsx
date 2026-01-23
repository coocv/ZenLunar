
import React from 'react';
import { X, Share, PlusSquare, MoreVertical, Download } from 'lucide-react';

interface InstallPwaGuideProps {
  onClose: () => void;
  isIos: boolean;
}

export const InstallPwaGuide: React.FC<InstallPwaGuideProps> = ({ onClose, isIos }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
           <h3 className="font-bold text-gray-800 text-lg">安装 ZenLunar</h3>
           <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
             <X size={20} />
           </button>
        </div>

        <div className="p-6 space-y-6">
           {isIos ? (
             <>
               <div className="flex items-start gap-4">
                  <div className="bg-gray-100 p-3 rounded-xl text-primary">
                     <Share size={24} />
                  </div>
                  <div>
                     <h4 className="font-bold text-gray-800 mb-1">1. 点击分享按钮</h4>
                     <p className="text-sm text-gray-500">在 Safari 浏览器底部工具栏中找到分享图标。</p>
                  </div>
               </div>

               <div className="w-px h-6 bg-gray-200 ml-8"></div>

               <div className="flex items-start gap-4">
                  <div className="bg-gray-100 p-3 rounded-xl text-gray-600">
                     <PlusSquare size={24} />
                  </div>
                  <div>
                     <h4 className="font-bold text-gray-800 mb-1">2. 添加到主屏幕</h4>
                     <p className="text-sm text-gray-500">向下滑动菜单，选择“添加到主屏幕”。</p>
                  </div>
               </div>
             </>
           ) : (
             <>
               <div className="flex items-start gap-4">
                  <div className="bg-gray-100 p-3 rounded-xl text-gray-600">
                     <MoreVertical size={24} />
                  </div>
                  <div>
                     <h4 className="font-bold text-gray-800 mb-1">1. 点击浏览器菜单</h4>
                     <p className="text-sm text-gray-500">通常位于屏幕右上角或底部的“三个点”图标。</p>
                  </div>
               </div>

               <div className="w-px h-6 bg-gray-200 ml-8"></div>

               <div className="flex items-start gap-4">
                  <div className="bg-gray-100 p-3 rounded-xl text-primary">
                     <Download size={24} />
                  </div>
                  <div>
                     <h4 className="font-bold text-gray-800 mb-1">2. 选择“安装应用”</h4>
                     <p className="text-sm text-gray-500">可能显示为“安装 ZenLunar”或“添加到主屏幕”。</p>
                  </div>
               </div>
             </>
           )}

           <div className="bg-primary/5 p-4 rounded-xl text-xs text-primary leading-relaxed mt-4">
              <p>💡 安装后，您将获得全屏沉浸式体验，且无需重复打开浏览器。</p>
           </div>
           
           <button 
             onClick={onClose}
             className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all"
           >
             知道了
           </button>
        </div>
      </div>
    </div>
  );
};
