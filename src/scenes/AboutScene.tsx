import React from 'react';
import { useAppStore } from '../store/useAppStore';

export const AboutScene: React.FC = () => {
  const { navigateToRoom } = useAppStore();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 md:p-12 pointer-events-auto">
      <div className="max-w-2xl w-full flex flex-col h-full justify-between">
        
        {/* Page Title */}
        <div className="text-center mt-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-zinc-900 font-bold tracking-widest">
            《 關於的網站 》
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center gap-10 px-4 md:px-12 text-center">
          <div className="font-serif text-lg text-zinc-700 leading-relaxed max-w-lg">
            <p className="mb-4">
              歡迎來到這個手繪博物館。這裡展示了各式各樣的手工藝皮革作品與文章紀錄。
            </p>
            <p>
              每一件作品都乘載了時間的溫度與手作的靈魂，希望能透過這個虛擬空間，將這份心意傳遞給您。
            </p>
          </div>

          {/* Social Media Links */}
          <div className="flex flex-col gap-4 mt-4">
            <h2 className="text-xl font-serif font-bold text-zinc-800 mb-2 border-b border-zinc-800/20 pb-1">
              聯絡與社群
            </h2>
            <div className="flex justify-center gap-6 font-serif">
              <a href="#" className="text-zinc-600 hover:text-zinc-900 transition-colors border-b border-zinc-400 hover:border-zinc-900 pb-0.5">
                Instagram
              </a>
              <a href="#" className="text-zinc-600 hover:text-zinc-900 transition-colors border-b border-zinc-400 hover:border-zinc-900 pb-0.5">
                Facebook
              </a>
              <a href="#" className="text-zinc-600 hover:text-zinc-900 transition-colors border-b border-zinc-400 hover:border-zinc-900 pb-0.5">
                Email
              </a>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 text-center mb-4">
          <button 
            onClick={() => navigateToRoom('home')}
            className="px-6 py-2 border border-zinc-800 text-zinc-800 hover:bg-zinc-800 hover:text-[#e4e1d9] transition-colors rounded font-serif text-sm tracking-wider"
          >
            返回首頁 (Return)
          </button>
        </div>
      </div>
    </div>
  );
};
