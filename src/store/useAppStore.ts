/**
 * @file store/useAppStore.ts
 * @description 全局狀態庫 (Global Application State Store)
 * 使用 Zustand 管理博物館房間導向、雙緩衝翻頁 (Double-Buffer Flip)、
 * 繪本語言切換動畫 (Book Swap) 以及 Notion CMS 連線狀態。
 */

import { create } from 'zustand';
import { AppState, Language, RoomId, ExhibitData, NotionConfig } from '../types';

// 音效合成器 (Web Audio Synthesizer for nostalgic interactive sounds)
const playAudioEffect = (type: 'flip' | 'click' | 'sketch' | 'door' | 'close' | 'open') => {
  if (typeof window !== 'undefined' && window.playAppSound) {
    if (type === 'flip' || type === 'open') {
      window.playAppSound('open');
      return;
    } else if (type === 'click') {
      window.playAppSound('click');
      return;
    } else if (type === 'close') {
      window.playAppSound('close');
      return;
    }
  }

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'flip') {
      // 白噪音模擬紙張翻頁聲 (Paper flip sweep noise)
      const bufferSize = ctx.sampleRate * 0.25;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.25);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      
      noise.connect(filter);
      filter.connect(gain);
      noise.start(now);
      noise.stop(now + 0.25);
    } else if (type === 'click') {
      // 點擊短音 (Pencil click tap)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'door') {
      // 開門音效 (Door transition creak)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.3);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch {
    // 靜音回退 (Silent fallback if Web Audio is restricted)
  }
};

// 讀取本地儲存的 Notion 設定 (Load stored Notion Config from localStorage)
const getInitialNotionConfig = (): NotionConfig => {
  try {
    const saved = localStorage.getItem('sketch_museum_notion_config');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // 忽略讀取錯誤
  }
  return {
    apiKey: '',
    craftsDbId: '',
    blogDbId: '',
    isConfigured: false,
  };
};

export const useAppStore = create<AppState>((set, get) => ({
  // 核心房間位置 (Core room navigation state)
  currentRoom: 'home',
  previousRoom: 'home',
  targetRoom: null,
  isFlipping: false,
  flipDirection: 'next',

  // 語系與繪本更換 (Language & sketchbook swap state)
  language: 'zh',
  isBookSwapping: false,

  // 介面選單狀態 (UI overlays)
  isMapOpen: false,
  activeModalExhibit: null,
  activeAlbum: null,
  isGuestbookOpen: false,
  isNotionConfigOpen: false,
  soundEnabled: true,

  // Notion CMS 設定 (Notion CMS credentials)
  notionConfig: getInitialNotionConfig(),

  // 音效控制 (Play audio effect)
  playSound: (type) => {
    if (get().soundEnabled) {
      playAudioEffect(type);
    }
  },

  toggleSound: () => {
    set((state) => ({ soundEnabled: !state.soundEnabled }));
  },

  // 語系切換 (觸發繪本更換連續動畫：合上畫冊 -> 更換畫冊 -> 開啟畫冊)
  setLanguage: (newLang: Language) => {
    if (get().language === newLang || get().isBookSwapping) return;

    get().playSound('flip');
    // 1. 觸發繪本合上與更換動畫 (Trigger Book Swap animation)
    set({ isBookSwapping: true });

    setTimeout(() => {
      // 2. 切換語系 (Apply new language)
      set({ language: newLang });

      setTimeout(() => {
        // 3. 完成繪本開啟動畫 (Complete Book Swap animation)
        set({ isBookSwapping: false });
      }, 600);
    }, 600);
  },

  // 房間導向 (觸發雙緩衝翻頁控制器 Double-Buffer Page Flip Engine)
  navigateToRoom: (targetRoom: RoomId) => {
    const state = get();
    if (state.currentRoom === targetRoom || state.isFlipping) return;

    const roomOrder: RoomId[] = ['home', 'works', 'leather1', 'exhibit', 'album', 'articles', 'articleList', 'photoList', 'about'];
    const currentIndex = roomOrder.indexOf(state.currentRoom);
    const targetIndex = roomOrder.indexOf(targetRoom);
    const direction = targetIndex >= currentIndex ? 'next' : 'prev';

    if (direction === 'prev' || targetRoom === 'home') {
      state.playSound('close' as any);
    } else {
      state.playSound('flip');
    }

    // 啟動雙緩衝翻頁 (Set targetRoom and start page flip double-buffering)
    set({
      targetRoom,
      isFlipping: true,
      flipDirection: direction,
      isMapOpen: false, // 自動關閉地圖選單 (Close drawer map if open)
    });
  },

  // 翻頁動畫結束時呼叫 (Commit completed page flip)
  completeFlip: () => {
    const { targetRoom, currentRoom } = get();
    if (targetRoom) {
      set({
        previousRoom: currentRoom,
        currentRoom: targetRoom,
        targetRoom: null,
        isFlipping: false,
      });
    } else {
      set({ isFlipping: false });
    }
  },

  // 地圖選單開關 (Toggle Drawer Map Menu)
  toggleMap: (open) => {
    const nextState = open !== undefined ? open : !get().isMapOpen;
    get().playSound('click');
    set({ isMapOpen: nextState });
  },

  // 設定當前檢視的展品並翻至該頁 (Set active exhibit and flip to exhibit page)
  setExhibitModal: (exhibit: ExhibitData | null) => {
    if (exhibit) get().playSound('click');
    set({ activeModalExhibit: exhibit });
    if (exhibit) {
      get().navigateToRoom('exhibit');
    }
  },

  // 設定當前檢視的相簿 (Set active album and flip to album page)
  setActiveAlbum: (album: any | null) => {
    if (album) get().playSound('click');
    set({ activeAlbum: album });
    if (album) {
      get().navigateToRoom('album');
    }
  },

  // 開關館長留言塗鴉板 (Toggle Curator's Guestbook/Doodle Canvas)
  setGuestbookOpen: (open) => {
    get().playSound('sketch');
    set({ isGuestbookOpen: open });
  },

  // 開關 Notion CMS 設定彈窗 (Toggle Notion setup guide modal)
  setNotionConfigOpen: (open) => {
    get().playSound('click');
    set({ isNotionConfigOpen: open });
  },

  // 更新 Notion 設定與持久化 (Update Notion API credentials)
  updateNotionConfig: (newConfig) => {
    set((state) => {
      const updated = {
        ...state.notionConfig,
        ...newConfig,
        isConfigured: Boolean(
          (newConfig.apiKey ?? state.notionConfig.apiKey) &&
          ((newConfig.craftsDbId ?? state.notionConfig.craftsDbId) ||
           (newConfig.blogDbId ?? state.notionConfig.blogDbId))
        ),
      };
      try {
        localStorage.setItem('sketch_museum_notion_config', JSON.stringify(updated));
      } catch {
        // 忽略儲存例外
      }
      return { notionConfig: updated };
    });
  },
}));
