/**
 * @file scenes/HomeScene.tsx
 * @description 博物館主展覽大廳 (Museum Main Hall Scene)
 * 核心首頁展區，包含雙側透視牆展畫、中央景深拱門，以及點觸切換至工藝館、圖書館與館長室之互動熱點。
 */

import React from 'react';
import { PerspectiveMuseumCanvas } from '../components/museum/PerspectiveMuseumCanvas';
import { Hotspot } from '../components/museum/Hotspot';
import { useAppStore } from '../store/useAppStore';
import { translations } from '../i18n/translations';

export const HomeScene: React.FC = () => {
  const { language, navigateToRoom } = useAppStore();
  const t = translations[language] || translations.zh;

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-0 md:p-0 pointer-events-auto">
      {/* 單點透視對稱主畫布 */}
      <PerspectiveMuseumCanvas 
        hallTitle={t.rooms.home.name.toUpperCase()}
        leftOverlay={
          <>
            {/* 左側遠處的門 (Far Left Door) -> 作品 */}
            <Hotspot
              hotspot={{ id: 'l-door-far', roomId: 'home', x: 50, y: 42, width: 20, height: 30, actionType: 'navigate', targetRoom: 'works', title: t.rooms['works'].name, tooltip: { zh: '作品展區', en: 'Works Gallery', ja: '作品展示館' } }}
              onClick={() => navigateToRoom('works')}
            />
            {/* 左側近處的門 (Near Left Door) -> 關於的網站 */}
            <Hotspot
              hotspot={{ id: 'l-door-near', roomId: 'home', x: 75, y: 30, width: 20, height: 45, actionType: 'navigate', targetRoom: 'about', title: '關於的網站', tooltip: { zh: '關於的網站', en: 'About Site', ja: 'サイトについて' } }}
              onClick={() => navigateToRoom('about')}
            />
          </>
        }
        rightOverlay={
          <>
            {/* 右側遠處的門 (Far Right Door) -> 文章與相片 (Articles & Photos) */}
            <Hotspot
              hotspot={{ id: 'r-door-far', roomId: 'home', x: 30, y: 42, width: 20, height: 30, actionType: 'navigate', targetRoom: 'articles', title: '文章與相片', tooltip: { zh: '文章與相片', en: 'Articles & Photos', ja: '記事と写真' } }}
              onClick={() => navigateToRoom('articles')}
            />
          </>
        }
      >
      </PerspectiveMuseumCanvas>
    </div>
  );
};
