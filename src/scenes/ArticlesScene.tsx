import React from 'react';
import { useAppStore } from '../store/useAppStore';

export const ArticlesScene: React.FC = () => {
  const { navigateToRoom } = useAppStore();
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 md:p-12 pointer-events-auto overflow-hidden">
      <div className="max-w-3xl w-full flex flex-col h-full justify-center gap-12 overflow-hidden items-center">
        
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-zinc-900 font-bold tracking-widest mb-4">
            《 紀 錄 與 隨 筆 》
          </h1>
          <p className="text-zinc-500 font-mono text-sm tracking-widest">ARCHIVES & MEMORIES</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-6 w-full max-w-sm">
          <button 
            onClick={() => navigateToRoom('articleList')}
            className="group relative px-8 py-6 border border-zinc-300 hover:border-zinc-800 bg-white/50 hover:bg-zinc-50 transition-all duration-300 flex flex-col items-center justify-center gap-2"
          >
            <span className="text-xl font-serif font-bold text-zinc-800 tracking-widest group-hover:scale-105 transition-transform">【 文 章 紀 錄 】</span>
            <span className="text-xs font-mono text-zinc-400">Read Articles</span>
          </button>

          <button 
            onClick={() => navigateToRoom('photoList')}
            className="group relative px-8 py-6 border border-zinc-300 hover:border-zinc-800 bg-white/50 hover:bg-zinc-50 transition-all duration-300 flex flex-col items-center justify-center gap-2"
          >
            <span className="text-xl font-serif font-bold text-zinc-800 tracking-widest group-hover:scale-105 transition-transform">【 相 片 紀 錄 】</span>
            <span className="text-xs font-mono text-zinc-400">View Albums</span>
          </button>
        </div>
        
        {/* Footer Navigation */}
        <div className="mt-12 text-center">
          <button 
            onClick={() => navigateToRoom('home')}
            className="px-6 py-2 border border-transparent text-zinc-500 hover:text-zinc-900 transition-colors rounded font-serif text-sm tracking-wider"
          >
            ← 返回首頁 (Back to Home)
          </button>
        </div>
      </div>
    </div>
  );
};
