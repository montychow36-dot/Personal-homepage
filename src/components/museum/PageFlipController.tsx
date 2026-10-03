/**
 * @file components/museum/PageFlipController.tsx
 * @description 雙緩衝繪本翻頁控制器 (Double-Buffer Page Flip Engine)
 * 實現流暢的手繪素描本 3D 翻頁轉場動畫。
 * 雙緩衝結構包含：
 * 1. CurrentPageLayer (頂層 - 當前展區畫面)
 * 2. NextPageLayer (底層 - 預先載入之目標展區畫面)
 * 3. FlippingLeaf (3D 旋轉葉片 - 沿著左側 spine 軸線執行 180 度 rotateY 翻轉)
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { RoomId } from '../../types';

interface PageFlipControllerProps {
  renderRoom: (roomId: RoomId) => React.ReactNode;
}

export const PageFlipController: React.FC<PageFlipControllerProps> = ({ renderRoom }) => {
  const { currentRoom, targetRoom, isFlipping, completeFlip, flipDirection } = useAppStore();

  // 翻頁完成自動呼叫 (Trigger state commit after flip transition completes)
  useEffect(() => {
    if (isFlipping && targetRoom) {
      const timer = setTimeout(() => {
        completeFlip();
      }, 1000); // 1000ms 翻頁動畫週期 (Extended for dramatic effect)
      return () => clearTimeout(timer);
    }
  }, [isFlipping, targetRoom, completeFlip]);

  // 若目前無翻頁動畫，直接渲染當前房間 (Standard state display when not flipping)
  if (!isFlipping || !targetRoom) {
    return <div className="w-full h-full relative">{renderRoom(currentRoom)}</div>;
  }

  // 是否向前翻頁 (Forward / Backward flip angle direction)
  const isNext = flipDirection === 'next';

  return (
    <div className="w-full h-full relative overflow-hidden select-none" style={{ perspective: '2000px' }}>
      {/* =========================================================================
       * 1. 底層預載目標頁面 (NextPageLayer - Pre-loaded Destination Page at z-10)
       * ========================================================================= */}
      <div className="absolute inset-0 z-10">
        {renderRoom(targetRoom)}
      </div>

      {/* =========================================================================
       * 2. 頂層當前頁面 (CurrentPageLayer - Animated 3D Paper Leaf at z-20)
       * 當前頁面會像真實書本一樣向上/向左翻轉並逐漸消失
       * ========================================================================= */}
      <AnimatePresence>
        <motion.div
          key={`flip-leaf-${currentRoom}`}
          initial={{ rotateY: 0, rotateX: 0, opacity: 1, scale: 1 }}
          animate={{ 
            rotateY: isNext ? -120 : 120, // 像書頁一樣翻轉 (Flip like a book page)
            rotateX: isNext ? 10 : -10,   // 邊緣微微翹起 (Slight curl on the edge)
            opacity: [1, 1, 0],           // 翻轉過半時逐漸消失 (Fade out when passing halfway)
            scale: 1.05                   // 翻轉時稍微放大製造立體感 (Pop out slightly)
          }}
          transition={{ duration: 1.0, ease: [0.4, 0.0, 0.2, 1] }} // 緩動函數讓翻頁感更真實
          style={{ 
            transformOrigin: isNext ? '-5% center' : '105% center', // 書脊在左側或右側 (Hinge point)
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden'
          }}
          className="absolute inset-0 z-20 pointer-events-none origin-left shadow-2xl bg-white"
        >
          {/* 翻頁紙張陰影與質感 (Paper Shadow & Texture Overlay) */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/5 to-transparent mix-blend-multiply pointer-events-none z-30" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          {renderRoom(currentRoom)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
