import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const StickyNoteAnnouncement: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 縮小的便利貼角標 (Small Sticky Note Widget) */}
      <motion.div
        className="fixed top-20 right-3 md:right-6 z-40 cursor-pointer pointer-events-auto"
        whileHover={{ scale: 1.05, rotate: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { delay: 0.5, duration: 0.5 } }}
      >
        <div className="relative w-16 h-16 md:w-20 md:h-20 bg-[#fef7ba] shadow-[2px_3px_6px_rgba(0,0,0,0.15)] flex items-center justify-center transform rotate-3 transition-transform hover:rotate-1">
          {/* 膠帶或圖釘 (Tape) */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-2 md:w-8 md:h-2.5 bg-white/60 border border-black/5 transform -rotate-2 shadow-sm backdrop-blur-sm"></div>
          
          <div className="text-center transform -rotate-3">
            <span className="block font-serif text-amber-900/80 font-bold text-xs md:text-sm">Notice</span>
            <span className="block font-serif text-amber-900/60 text-[10px] mt-1 border-t border-amber-900/20 pt-1 mx-2">公告</span>
          </div>
          
          {/* 摺角陰影效果 (Slight fold shadow at bottom right) */}
          <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[8px] border-l-[8px] border-b-transparent border-l-black/10"></div>
        </div>
      </motion.div>

      {/* 點擊展開的便利貼 (Expanded Sticky Note Modal) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/10 backdrop-blur-[2px] pointer-events-auto"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, rotate: -6, y: 40 }}
              animate={{ scale: 1, rotate: 1, y: 0 }}
              exit={{ scale: 0.8, rotate: 6, y: 40 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()} // 阻止點擊背景關閉
              className="relative w-full max-w-sm bg-[#fef7ba] shadow-2xl p-8 md:p-10 flex flex-col font-serif"
            >
              {/* 大膠帶 (Large Tape) */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-28 h-7 bg-white/50 border border-black/5 transform -rotate-2 shadow-sm backdrop-blur-md"></div>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-3 text-amber-900/40 hover:text-amber-900 transition-colors p-2 text-xl font-mono"
              >
                ✕
              </button>

              <h3 className="text-xl font-bold text-amber-950 mb-5 border-b border-amber-900/10 pb-3 flex items-center">
                📌 最新通知 (Notice)
              </h3>
              <div className="text-amber-900/85 leading-loose space-y-4 text-sm md:text-base">
                <p>您好！歡迎來到這本皮革手冊。</p>
                <p>本網站以「閱讀實體書籍」為概念設計。您可以透過左上角的目錄，或點擊展品來翻閱不同的頁面。</p>
                <p>目前展示區正在陸續建置中，部分文章和皮革作品會持續更新，請您放慢腳步，享受這段瀏覽時光。</p>
                <p className="mt-8 text-right font-bold text-amber-950/70 border-t border-amber-900/10 pt-4">
                  - 網站管理員 敬上
                </p>
              </div>
              
              {/* 底部摺角 */}
              <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[20px] border-l-[20px] border-b-transparent border-l-black/5"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
