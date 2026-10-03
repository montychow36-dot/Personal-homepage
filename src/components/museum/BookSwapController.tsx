/**
 * @file components/museum/BookSwapController.tsx
 * @description 語言切換繪本更換控制器 (Sketchbook Swap Animation Engine)
 * 當使用者切換語系 (ZH / EN / JA) 時，觸發連續繪本動畫：
 * 「合上當前語言繪本 -> 換上新語言繪本封面 -> 翻開繪本至該展區」
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { Language } from '../../types';

interface BookSwapControllerProps {
  children: React.ReactNode;
}

export const BookSwapController: React.FC<BookSwapControllerProps> = ({ children }) => {
  const { isBookSwapping, language } = useAppStore();

  const getLanguageLabel = (lang: Language) => {
    switch (lang) {
      case 'zh':
        return '【繁體中文館藏手繪冊】';
      case 'en':
        return '【English Museum Collection Book】';
      case 'ja':
        return '【日本語館蔵スケッチブック】';
      default:
        return '【Sketchbook】';
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* 繪本更換過渡覆蓋動畫 (Book Swap Transition Overlay) */}
      <AnimatePresence>
        {isBookSwapping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotateY: 90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.95, rotateY: -90 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-900/70 backdrop-blur-md p-6 pointer-events-auto"
          >
            {/* 精美手繪繪本封面 (Hand-Drawn Sketchbook Cover) */}
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              className="w-full max-w-md p-8 bg-[#89a4b8] border border-zinc-800 shadow-2xl flex flex-col items-center text-center space-y-4"
            >
              {/* 封面皮套金扣裝飾 */}
              <div className="w-16 h-4 border border-zinc-800 bg-zinc-800/10 rotate-[-2deg]" />
              
              <div className="w-20 h-20 rounded-full border-2 border-zinc-800 flex items-center justify-center bg-zinc-800/10">
                <span className="text-3xl">📖</span>
              </div>

              <h3 className="text-xl font-serif font-bold text-zinc-900 tracking-wider">
                {getLanguageLabel(language)}
              </h3>

              <p className="text-xs font-mono text-zinc-600 animate-pulse">
                更換畫冊語系中 / Swapping Language Book...
              </p>

              <div className="w-full h-1 bg-zinc-800/20 rounded-full overflow-hidden mt-2">
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-1/2 h-full bg-zinc-800"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 繪本內部頁面內容 (Sketchbook Page Content) */}
      <div className={`w-full h-full transition-filter duration-300 ${isBookSwapping ? 'filter blur-sm opacity-40' : ''}`}>
        {children}
      </div>
    </div>
  );
};
