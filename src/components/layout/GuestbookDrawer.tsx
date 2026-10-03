/**
 * @file components/layout/GuestbookDrawer.tsx
 * @description 館長室手繪留言板與互動畫布 (Curator's Office Guestbook & Doodle Canvas)
 * 允許訪客使用手繪鉛筆與炭筆工具在畫布上自由創作筆劃、簽名並留言留念。
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n/translations';

export const GuestbookDrawer: React.FC = () => {
  const { isGuestbookOpen, setGuestbookOpen, language, playSound } = useAppStore();
  const t = translations[language] || translations.zh;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#2d2b2a');
  const [brushSize, setBrushSize] = useState(3);
  const [hasDrawn, setHasDrawn] = useState(false);

  // 初始化畫布尺寸與紙張背景 (Initialize canvas context)
  useEffect(() => {
    if (isGuestbookOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // 紙張柔和底色 (Soft sketchbook paper tint)
        ctx.fillStyle = '#fbf9f3';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [isGuestbookOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    playSound('sketch');
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.strokeStyle = brushColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#fbf9f3';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setHasDrawn(false);
        playSound('click');
      }
    }
  };

  return (
    <AnimatePresence>
      {isGuestbookOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setGuestbookOpen(false)}
            className="fixed inset-0 bg-zinc-900/70 backdrop-blur-sm"
          />

          {/* 留言板彈窗 */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-[#89a4b8] border border-zinc-800 shadow-2xl p-6 md:p-8 z-10 flex flex-col space-y-4"
          >
            {/* 標題與關閉 */}
            <div className="flex items-center justify-between border-b border-dashed border-zinc-800/30 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">✏️</span>
                <div>
                  <h3 className="text-lg font-serif font-bold text-zinc-900">
                    {t.aboutScene.guestbookTitle}
                  </h3>
                  <p className="text-xs text-zinc-600 font-sans">
                    {t.aboutScene.guestbookSubtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGuestbookOpen(false)}
                className="px-3 py-1 text-xs font-mono font-bold hover:bg-zinc-800/10 rounded"
              >
                ✕ {t.common.close}
              </button>
            </div>

            {/* 畫筆工具列 (Brush Control Toolbar) */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 border-y border-dashed border-zinc-800/20 text-xs">
              {/* 筆觸顏色選擇 */}
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-zinc-800">墨色：</span>
                {['#2d2b2a', '#78350f', '#1e3a8a', '#991b1b'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setBrushColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-6 h-6 rounded-full border-2 border-zinc-900 shadow-sm transition-transform ${
                      brushColor === color ? 'scale-125 ring-2 ring-amber-400' : 'opacity-80'
                    }`}
                  />
                ))}
              </div>

              {/* 粗細選擇 */}
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-zinc-800">筆觸粗細：</span>
                {[2, 4, 8].map((size) => (
                  <button
                    key={size}
                    onClick={() => setBrushSize(size)}
                    className={`px-2 py-0.5 rounded sketch-button text-xs font-mono ${
                      brushSize === size ? 'bg-zinc-900 text-amber-50 font-bold' : 'text-zinc-800'
                    }`}
                  >
                    {size}px
                  </button>
                ))}
              </div>

              {/* 清除按鈕 */}
              <button
                onClick={clearCanvas}
                className="sketch-button px-3 py-1 text-xs font-serif text-zinc-900 bg-zinc-800/20"
              >
                🗑️ {t.aboutScene.clearCanvas}
              </button>
            </div>

            {/* 手繪 Canvas 區域 */}
            <div className="w-full aspect-[4/3] border-2 border-dashed border-zinc-800/20 overflow-hidden relative cursor-crosshair">
              <canvas
                ref={canvasRef}
                width={600}
                height={450}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
                className="w-full h-full touch-none"
              />
              {!hasDrawn && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 text-xs font-serif text-zinc-600">
                  ✎ 按住滑鼠或手指在此處試筆手繪...
                </div>
              )}
            </div>

            {/* 完成按鈕 */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setGuestbookOpen(false)}
                className="sketch-button px-5 py-2 text-xs font-serif font-bold bg-zinc-900 text-amber-50"
              >
                ✓ {t.aboutScene.saveDoodle}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
