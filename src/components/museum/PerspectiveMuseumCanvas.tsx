/**
 * @file components/museum/PerspectiveMuseumCanvas.tsx
 * @description 單點透視防拉伸畫布 (Symmetrical One-Point Perspective Museum Canvas)
 * 解決不同裝置螢幕長寬比造成的畫面變形與圖片拉伸。
 * 將畫廊切割為：[左側透視牆 (固定比例)] + [中央彈性延伸區 (吸收寬度)] + [右側透視牆 (固定比例)]
 */

import React from 'react';

interface PerspectiveMuseumCanvasProps {
  children?: React.ReactNode;
  leftOverlay?: React.ReactNode;
  rightOverlay?: React.ReactNode;
  centerOverlay?: React.ReactNode;
  hallTitle?: string;
  className?: string;
  leftBg?: string;
  rightBg?: string;
  leftContainerClassName?: string;
  rightContainerClassName?: string;
}

export const PerspectiveMuseumCanvas: React.FC<PerspectiveMuseumCanvasProps> = ({
  children,
  leftOverlay,
  rightOverlay,
  centerOverlay,
  hallTitle = 'MAIN GALLERY',
  className = '',
  leftBg = '/L.png',
  rightBg = '/R.png',
  leftContainerClassName = 'scale-[1.0] md:scale-[1.05] origin-left',
  rightContainerClassName = 'scale-[1.15] md:scale-[1.2] origin-right',
}) => {
  return (
    <div className={`relative w-full h-[90vh] min-h-[600px] max-h-[1200px] flex items-stretch select-none overflow-hidden ${className}`}>
      {/* =========================================================================
       * 1. 左側透視牆區域 (Left Sketch - Fixed Aspect Ratio Section)
       * ========================================================================= */}
      <div className="relative w-[45%] md:w-[42%] h-full min-w-[150px] max-w-[800px] flex-shrink-0 flex flex-col justify-center items-start">
        <div className={`relative inline-block max-w-full max-h-full pointer-events-auto ${leftContainerClassName}`}>
          <img src={leftBg} alt="Left Wall Sketch" className="block max-w-full max-h-full w-auto h-auto pointer-events-none mix-blend-multiply" />
          {leftOverlay && (
            <div className="absolute inset-0 z-10 pointer-events-auto">
              {leftOverlay}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
       * 2. 中央彈性延伸區 (Flexible Center Gap - Absorbs Screen Width Differences)
       * ========================================================================= */}
      <div className="relative flex-1 min-w-[10%] md:min-w-[16%] flex flex-col items-center justify-between py-6 px-2 overflow-hidden">
        {/* 空白延伸區 (Empty Flexible Space) */}
        <div className="w-full h-full relative flex items-center justify-center">
          {centerOverlay && (
            <div className="absolute inset-0 z-10 pointer-events-auto">
              {centerOverlay}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
       * 3. 右側透視牆區域 (Right Sketch - Fixed Aspect Ratio Section)
       * ========================================================================= */}
      <div className="relative w-[45%] md:w-[42%] h-full min-w-[150px] max-w-[800px] flex-shrink-0 flex flex-col justify-center items-end">
        <div className={`relative inline-block max-w-full max-h-full pointer-events-auto ${rightContainerClassName}`}>
          <img src={rightBg} alt="Right Wall Sketch" className="block max-w-full max-h-full w-auto h-auto pointer-events-none mix-blend-multiply" />
          {rightOverlay && (
            <div className="absolute inset-0 z-10 pointer-events-auto">
              {rightOverlay}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
       * 4. 點觸熱點與子組件覆蓋層 (Hotspots & Interactive Elements Overlay)
       * ========================================================================= */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {children}
      </div>
    </div>
  );
};
