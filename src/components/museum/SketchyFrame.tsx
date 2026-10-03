/**
 * @file components/museum/SketchyFrame.tsx
 * @description 手繪風格卡片與框線容器 (Hand-drawn Frame & Card Container)
 * 帶有不規則粗細鉛筆邊框、角落紙張貼紙與膠帶質感。
 */

import React from 'react';

interface SketchyFrameProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'card' | 'thick' | 'paper';
  hasTape?: boolean;
}

export const SketchyFrame: React.FC<SketchyFrameProps> = ({
  children,
  className = '',
  variant = 'card',
  hasTape = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'thick':
        return 'sketch-border-thick bg-zinc-800/10';
      case 'paper':
        return 'sketch-paper-card';
      case 'card':
      default:
        return 'sketch-border bg-zinc-800/10';
    }
  };

  return (
    <div className={`relative p-4 text-zinc-900 shadow-md ${getVariantStyles()} ${className}`}>
      {/* 頂部裝飾性手繪膠帶 (Hand-drawn Paper Tape Effect) */}
      {hasTape && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-20 h-5 bg-zinc-800/20 border border-amber-300/80 rotate-1 shadow-sm opacity-90 backdrop-blur-[1px]" />
      )}
      {children}
    </div>
  );
};
