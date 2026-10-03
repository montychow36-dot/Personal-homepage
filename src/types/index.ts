/**
 * @file types/index.ts
 * @description 博物館系統核心型態定義檔 (Core System Type Definitions)
 * 包含展覽館房間、熱點、語言設定、Notion CMS 資料結構與狀態庫介面。
 */

// 展覽館房間識別碼 (Museum Room IDs)
export type RoomId = 'home' | 'works' | 'articles' | 'articleList' | 'photoList' | 'exhibit' | 'leather1' | 'about' | 'album';

// 支援語系 (Supported Languages)
export type Language = 'zh' | 'en' | 'ja';

// 熱點動作類型 (Hotspot Action Types)
export type HotspotActionType = 
  | 'navigate'    // 房間切換 (Navigate between rooms)
  | 'modal'       // 彈出展品詳細說明 (Open exhibit detail modal)
  | 'audio'       // 播放語音導覽 (Play audio guide/narration)
  | 'guestbook'   // 開啟館長留言板/塗鴉牆 (Open Curator's Guestbook/Doodle canvas)
  | 'notion_item' // 檢視指定 Crafts 或 Blog 條目 (Inspect specific Notion entry)
  | 'secret';     // 隱藏手繪彩蛋 (Hidden sketch easter egg)

// 熱點資料結構 (% 為基準的相對座標系統，防止畫面拉伸錯位)
export interface Hotspot {
  id: string;
  roomId: RoomId;
  title: Record<Language, string> | string;
  tooltip: Record<Language, string> | string;
  x: number;      // 左邊界相對百分比 (Left percentage: 0 ~ 100)
  y: number;      // 上邊界相對百分比 (Top percentage: 0 ~ 100)
  width: number;  // 寬度百分比 (Width percentage)
  height: number; // 高度百分比 (Height percentage)
  actionType: HotspotActionType;
  targetRoom?: RoomId;
  itemData?: ExhibitData;
  icon?: string;
}

// 展品展示資料 (Exhibit Data)
export interface ExhibitData {
  id: string;
  title: Record<Language, string>;
  category: Record<Language, string>;
  date: string;
  description: Record<Language, string>;
  sketchSvgPath?: string;
  imageUrl?: string;
  images?: string[];
  pages?: Record<number, string[]>;
  tags?: string[];
  notionUrl?: string;
}

// 工藝展品資料型態 (Crafts Gallery Item Interface)
export interface CraftItem {
  id: string;
  title: string;
  category: string;
  material: string;
  era: string;
  description: string;
  sketchUrl?: string;
  featured?: boolean;
  notionId?: string;
}

// 文獻檔案文章型態 (Archives Blog Article Interface)
export interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  publishDate: string;
  author: string;
  tags: string[];
  readTime: string;
  notionId?: string;
}

// Notion CMS 設定 (Notion API Connection Config)
export interface NotionConfig {
  apiKey: string;
  craftsDbId: string;
  blogDbId: string;
  isConfigured: boolean;
}

// 全局狀態庫型態定義 (Global App Store State)
export interface AppState {
  // 導覽與雙緩衝翻頁狀態 (Navigation & Double-Buffer Flip State)
  currentRoom: RoomId;
  previousRoom: RoomId;
  targetRoom: RoomId | null;
  isFlipping: boolean;
  flipDirection: 'next' | 'prev';

  // 語系與繪本切換狀態 (Language & Sketchbook Swap State)
  language: Language;
  isBookSwapping: boolean;

  // 介面選單與彈窗 (UI Overlay & Modal States)
  isMapOpen: boolean;
  activeModalExhibit: ExhibitData | null;
  activeAlbum: any | null;
  isGuestbookOpen: boolean;
  isNotionConfigOpen: boolean;
  soundEnabled: boolean;

  // Notion 整合設定 (Notion Integration Setup)
  notionConfig: NotionConfig;

  // 狀態變更動作 (Store Actions)
  setLanguage: (lang: Language) => void;
  navigateToRoom: (room: RoomId) => void;
  completeFlip: () => void;
  toggleMap: (open?: boolean) => void;
  setExhibitModal: (exhibit: ExhibitData | null) => void;
  setActiveAlbum: (album: any | null) => void;
  setGuestbookOpen: (open: boolean) => void;
  setNotionConfigOpen: (open: boolean) => void;
  updateNotionConfig: (config: Partial<NotionConfig>) => void;
  toggleSound: () => void;
  playSound: (type: 'flip' | 'click' | 'sketch' | 'door') => void;
}
