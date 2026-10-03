/**
 * @file components/layout/Header.tsx
 * @description 右上方透明三劃櫃桶選單按鈕 (Transparent Top-Right 3-Line Hamburger Menu & Book Header)
 */
import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n/translations';
import { SoundControl } from './SoundControl';

export const Header: React.FC = () => {
  const {
    language,
    currentRoom,
    toggleMap,
    isMapOpen,
  } = useAppStore();

  const t = translations[language] || translations.zh;
  const currentRoomName = t.rooms[currentRoom]?.name || '展區';

  return (
    <header className="fixed top-3 left-3 right-3 md:top-4 md:left-6 md:right-6 z-40 pointer-events-none flex items-center justify-between">
      {/* 左方：透明三劃櫃桶選單 (Floating Transparent 3-Line Hamburger) */}
      <div className="pointer-events-auto flex items-center space-x-2">
        <button
          onClick={() => toggleMap()}
          aria-label="選單櫃桶"
          className={`p-2.5 rounded-xl border-2 transition-all flex items-center justify-center backdrop-blur-md shadow-md cursor-pointer ${
            isMapOpen
              ? 'bg-zinc-900 text-amber-50 border-zinc-900'
              : 'bg-zinc-800/10 hover:bg-zinc-800/20 text-zinc-900 border-zinc-800/80'
          }`}
        >
          <svg className="w-6 h-6 stroke-current stroke-[2.5]" viewBox="0 0 24 24" fill="none" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </div>

      {/* 右方：Sound Control */}
      <SoundControl />
    </header>
  );
};

