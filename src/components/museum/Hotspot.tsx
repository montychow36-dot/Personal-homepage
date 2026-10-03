/**
 * @file components/museum/Hotspot.tsx
 * @description 點觸互動熱點組件 (Point-and-Click Interactive Hotspot)
 * 使用相對百分比座標 (x: %, y: %, width: %, height: %) 定位，
 * 確保在任何裝置解析度與長寬比下皆能精確對齊透視牆面展品與門口。
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Hotspot as HotspotType } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface HotspotProps {
  hotspot: HotspotType;
  onClick?: () => void;
}

export const Hotspot: React.FC<HotspotProps> = ({ hotspot, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { language, playSound } = useAppStore();

  const title = typeof hotspot.title === 'string' ? hotspot.title : (hotspot.title[language] || hotspot.title.zh);
  const tooltip = typeof hotspot.tooltip === 'string' ? hotspot.tooltip : (hotspot.tooltip[language] || hotspot.tooltip.zh);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('click');
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className="absolute cursor-pointer group z-50 select-none pointer-events-auto"
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        width: `${hotspot.width}%`,
        height: `${hotspot.height}%`,
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        playSound('click');
      }}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onPointerDown={handleClick}
    >
      {/* 隱形互動熱點 (Invisible Clickable Area) */}
      <div 
        className={`w-full h-full rounded-lg transition-all duration-300 flex items-center justify-center relative ${
          isHovered ? 'bg-black/10' : 'bg-transparent'
        }`}
        onClick={handleClick}
      >
        {/* 懸浮提示框 (Hand-drawn Tooltip Box) */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-[#89a4b8] text-zinc-900 px-3 py-1.5 rounded-md sketch-border shadow-xl z-30 pointer-events-none"
          >
            <p className="text-xs font-bold font-serif tracking-wide text-zinc-900 flex items-center gap-1">
              <span>{title}</span>
            </p>
            <p className="text-[10px] text-zinc-600 font-sans">{tooltip}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
