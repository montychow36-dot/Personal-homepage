/**
 * @file App.tsx
 * @description 手繪素描博物館 SPA 核心根組件 (Main App Root Component)
 */

import React from 'react';
import { BackgroundPaper } from './components/layout/BackgroundPaper';
import { Header } from './components/layout/Header';
import { DrawerMenu } from './components/layout/DrawerMenu';
import { NotionConfigModal } from './components/layout/NotionConfigModal';
import { GuestbookDrawer } from './components/layout/GuestbookDrawer';
import { BookSwapController } from './components/museum/BookSwapController';
import { PageFlipController } from './components/museum/PageFlipController';
import { AudioPlayer } from './components/layout/AudioPlayer';
import { StickyNoteAnnouncement } from './components/layout/StickyNoteAnnouncement';
import { HomeScene } from './scenes/HomeScene';
import { WorksScene } from './scenes/WorksScene';
import { ArticlesScene } from './scenes/ArticlesScene';
import { ArticleListScene } from './scenes/ArticleListScene';
import { PhotoListScene } from './scenes/PhotoListScene';
import { ExhibitScene } from './scenes/ExhibitScene';
import { AlbumScene } from './scenes/AlbumScene';
import { Leather1Scene } from './scenes/Leather1Scene';
import { AboutScene } from './scenes/AboutScene';
import { RoomId } from './types';

export default function App() {
  const renderRoom = (roomId: RoomId) => {
    switch (roomId) {
      case 'home': return <HomeScene />;
      case 'works': return <WorksScene />;
      case 'articles': return <ArticlesScene />;
      case 'articleList': return <ArticleListScene />;
      case 'photoList': return <PhotoListScene />;
      case 'exhibit': return <ExhibitScene />;
      case 'album': return <AlbumScene />;
      case 'leather1': return <Leather1Scene />;
      case 'about': return <AboutScene />;
      default: return <HomeScene />;
    }
  };

  return (
    <div className="relative min-h-screen w-full text-zinc-900 font-sans select-none overflow-x-hidden">
      <AudioPlayer />
      <BackgroundPaper />
      <Header />
      <main className="relative z-10 pt-16 md:pt-20 pb-8 px-2 md:px-6 min-h-[calc(100vh-80px)] flex flex-col justify-center items-center">
        <BookSwapController>
          <PageFlipController renderRoom={renderRoom} />
        </BookSwapController>
      </main>
      <StickyNoteAnnouncement />
      <DrawerMenu />
      <NotionConfigModal />
      <GuestbookDrawer />
    </div>
  );
}
