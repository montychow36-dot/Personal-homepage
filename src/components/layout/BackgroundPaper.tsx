/**
 * @file components/layout/BackgroundPaper.tsx
 * @description 全局手繪素描本底紙圖層 (Base Layer Notebook Paper Background)
 * 提供使用者上傳的真實筆記本紙張質感 (Real Notebook Paper Texture from User Upload)。
 */

import React from 'react';
import { getAssetUrl } from '../../utils/assets';

export const BackgroundPaper: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden" 
      style={{ 
        backgroundColor: '#89a4b8',
        backgroundImage: `url("${getAssetUrl('background.jpg')}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    />
  );
};

