/**
 * @file i18n/translations.ts
 * @description 多語系文字對照檔 (i18n Translations Dictionary)
 * 支援 繁體中文 (ZH)、英文 (EN) 與 日文 (JA) 三種語言對照。
 */

import { Language } from '../types';

export interface TranslationDictionary {
  museumTitle: string;
  museumSubtitle: string;
  rooms: {
    home: { name: string; desc: string; hotspotTag: string };
    works: { name: string; desc: string; hotspotTag: string };
    articles: { name: string; desc: string; hotspotTag: string };
  };
  header: {
    mapButton: string;
    notionConfigButton: string;
    audioOn: string;
    audioOff: string;
    langSwitch: string;
  };
  mapDrawer: {
    title: string;
    subtitle: string;
    close: string;
    exploreRoom: string;
  };
  notionModal: {
    title: string;
    subtitle: string;
    apiKeyLabel: string;
    craftsDbLabel: string;
    blogDbLabel: string;
    saveButton: string;
    statusConnected: string;
    statusDemoMode: string;
    setupGuideTitle: string;
    setupGuideSteps: string[];
  };
  craftsScene: {
    title: string;
    subtitle: string;
    cabinetTitle: string;
    clickToInspect: string;
    filterAll: string;
    notionSourceBadge: string;
    fallbackSourceBadge: string;
    material: string;
    era: string;
    category: string;
  };
  blogScene: {
    title: string;
    subtitle: string;
    bookshelfTitle: string;
    articleCount: string;
    readTime: string;
    author: string;
    publishDate: string;
    tags: string;
  };
  aboutScene: {
    title: string;
    subtitle: string;
    curatorNote: string;
    curatorBio: string;
    guestbookButton: string;
    guestbookTitle: string;
    guestbookSubtitle: string;
    clearCanvas: string;
    saveDoodle: string;
  };
  common: {
    close: string;
    inspect: string;
    backToHall: string;
    loading: string;
    error: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  zh: {
    museumTitle: '手繪素描博物館',
    museumSubtitle: '一頁一畫·時光之館',
    rooms: {
      home: { name: '展覽大廳', desc: '貫穿館內的中央迴廊，欣賞鎮館素描與各展區入口。', hotspotTag: '展覽大廳' },
      works: { name: '作品展區', desc: '手繪皮革作品與其他創作展示區。', hotspotTag: '作品' },
      articles: { name: '文章與相片', desc: '文章與相片集錦', hotspotTag: '文章與相片' },
    },
    header: {
      mapButton: '地圖導覽',
      notionConfigButton: 'Notion CMS 設定',
      audioOn: '音效：開啟',
      audioOff: '音效：靜音',
      langSwitch: '切換語言',
    },
    mapDrawer: {
      title: '博物館全館導覽地圖',
      subtitle: '點擊地圖上的房間區域，開啟翻頁動畫前往該展區',
      close: '關閉地圖',
      exploreRoom: '進入展區',
    },
    notionModal: {
      title: 'Notion Headless CMS 整合設定',
      subtitle: '本館支援 Notion API 自動同步 Crafts 工藝展品與 Blog 文章',
      apiKeyLabel: 'Notion Integration Token (API Key)',
      craftsDbLabel: 'Crafts 工藝資料庫 Database ID',
      blogDbLabel: 'Blog 文獻資料庫 Database ID',
      saveButton: '儲存並連線 Notion',
      statusConnected: '目前狀態：已連線至 Notion 資料庫',
      statusDemoMode: '目前狀態：示範模式（使用內建展示資料）',
      setupGuideTitle: 'Notion CMS 設定教學（ Traditional Chinese 指南）：',
      setupGuideSteps: [
        '1. 前往 notion.so/my-integrations 建立新的 Integration 並複製 Internal Integration Token。',
        '2. 在 Notion 中建立 Crafts 與 Blog 資料庫，將欄位設為 Name、Category、Material、Era、Description、Date、Content。',
        '3. 點擊資料庫右上角「...」->「Add connections」連結剛建立的 Integration。',
        '4. 複製資料庫網址中的 ID 填入上方欄位（或設定於 .env 中的 NOTION_API_KEY / NOTION_DATABASE_ID）。',
      ],
    },
    craftsScene: {
      title: '工藝展品館 (Crafts Gallery)',
      subtitle: '左側為透視櫥窗展櫃，點擊物件可於右側檢視詳細手繪記錄與細節',
      cabinetTitle: '展示櫥窗 (Display Cabinet)',
      clickToInspect: '點擊櫥窗展品以放大檢視',
      filterAll: '全部展品',
      notionSourceBadge: '資料來源：Notion CMS API',
      fallbackSourceBadge: '資料來源：館藏展示檔',
      material: '材質工藝',
      era: '創作年代',
      category: '展品分類',
    },
    blogScene: {
      title: '文獻圖書館 (Archives Library)',
      subtitle: '左側為典藏書架，點擊書脊即可於右側閱讀完整文獻紀錄',
      bookshelfTitle: '典藏書架 (Archives Bookshelf)',
      articleCount: '典藏篇數',
      readTime: '閱讀時間',
      author: '紀錄者',
      publishDate: '典藏日期',
      tags: '主題標籤',
    },
    aboutScene: {
      title: '館長室與留言牆 (Curator Office & Board)',
      subtitle: '感受手繪博物館的創立初衷，並在留言牆留下您的專屬筆觸',
      curatorNote: '「一筆一畫，皆是歲月的刻痕。這座博物館不使用璀璨的霓虹，只保留最純粹的鉛筆與紙張韻味。」',
      curatorBio: '館長手記：本館建築設計採用單點透視與對稱結構，無論在手機或寬螢幕上均能保有手繪畫冊的溫度。',
      guestbookButton: '開啟互動筆友留言板',
      guestbookTitle: '館長室手繪留言繪本',
      guestbookSubtitle: '請拿起鉛筆，在下方手繪板留下您的繪畫或簽名：',
      clearCanvas: '清除筆畫',
      saveDoodle: '完成並留念',
    },
    common: {
      close: '關閉',
      inspect: '放大檢視',
      backToHall: '返回主大廳',
      loading: '載入展品中...',
      error: '讀取發生錯誤',
    },
  },
  en: {
    museumTitle: 'Sketch Museum',
    museumSubtitle: 'Pages of Time · Hand-Drawn Gallery',
    rooms: {
      home: { name: 'Main Hall', desc: 'Central corridor featuring prime sketches and room entrances.', hotspotTag: 'Main Hall' },
      works: { name: 'Works Gallery', desc: 'Hand-drawn leather works and other creations.', hotspotTag: 'Works' },
      articles: { name: 'Articles & Photos', desc: 'Essays, photos and articles collection', hotspotTag: 'Articles & Photos' },
    },
    header: {
      mapButton: 'Museum Map',
      notionConfigButton: 'Notion CMS Settings',
      audioOn: 'Sound: ON',
      audioOff: 'Sound: OFF',
      langSwitch: 'Language',
    },
    mapDrawer: {
      title: 'Museum Floorplan Map',
      subtitle: 'Click any room area on the hand-drawn map to trigger a page flip transition',
      close: 'Close Map',
      exploreRoom: 'Enter Room',
    },
    notionModal: {
      title: 'Notion Headless CMS Integration',
      subtitle: 'This museum syncs Crafts and Blog articles dynamically with Notion API',
      apiKeyLabel: 'Notion Integration Token (API Key)',
      craftsDbLabel: 'Crafts Database ID',
      blogDbLabel: 'Blog Database ID',
      saveButton: 'Save & Connect to Notion',
      statusConnected: 'Status: Connected to Notion Database',
      statusDemoMode: 'Status: Demo Mode (Using internal museum collection)',
      setupGuideTitle: 'Notion Setup Instructions:',
      setupGuideSteps: [
        '1. Go to notion.so/my-integrations, create an Integration and copy Internal Integration Token.',
        '2. Create Crafts and Blog databases in Notion with fields: Name, Category, Material, Era, Description, Date, Content.',
        '3. Click database menu (...) -> "Add connections" -> connect your new Integration.',
        '4. Paste Database IDs above or define NOTION_API_KEY & NOTION_DATABASE_ID in your .env.',
      ],
    },
    craftsScene: {
      title: 'Crafts Gallery',
      subtitle: 'Interactive perspective display cabinet on the left. Click items to view details.',
      cabinetTitle: 'Display Cabinet',
      clickToInspect: 'Click cabinet items to inspect details',
      filterAll: 'All Crafts',
      notionSourceBadge: 'Data Source: Notion API',
      fallbackSourceBadge: 'Data Source: Museum Local Collection',
      material: 'Material',
      era: 'Creation Era',
      category: 'Category',
    },
    blogScene: {
      title: 'Archives Library',
      subtitle: 'Click book spines on the left catalog bookshelf to read articles on the right.',
      bookshelfTitle: 'Archives Bookshelf',
      articleCount: 'Total Volumes',
      readTime: 'Read Time',
      author: 'Author',
      publishDate: 'Date',
      tags: 'Tags',
    },
    aboutScene: {
      title: 'Curator Office & Board',
      subtitle: 'Experience the museum philosophy and leave your own pencil stroke on the guestboard.',
      curatorNote: '"Every stroke carries time. We replace flashy neon with pure pencil line and paper warmth."',
      curatorBio: 'Curator Note: Designed with symmetrical one-point perspective and anti-stretching system.',
      guestbookButton: 'Open Interactive Guest Doodle Canvas',
      guestbookTitle: 'Curator Guestbook Sketchpad',
      guestbookSubtitle: 'Pick up your pencil and draw or leave your signature below:',
      clearCanvas: 'Clear Canvas',
      saveDoodle: 'Save Sketch',
    },
    common: {
      close: 'Close',
      inspect: 'Inspect',
      backToHall: 'Back to Main Hall',
      loading: 'Loading exhibits...',
      error: 'Error loading data',
    },
  },
  ja: {
    museumTitle: '手描きスケッチ美術館',
    museumSubtitle: '一頁一画·時を刻む素描館',
    rooms: {
      home: { name: 'メインホール', desc: '館内の中央廊下。名作スケッチと各展示室の入口。', hotspotTag: 'メインホール' },
      works: { name: '作品展示館', desc: '手描きレザー作品とその他の創作展示。', hotspotTag: '作品' },
      articles: { name: '記事と写真', desc: '記事と写真コレクション', hotspotTag: '記事と写真' },
    },
    header: {
      mapButton: '館內マップ',
      notionConfigButton: 'Notion CMS 設定',
      audioOn: '効果音：ON',
      audioOff: '効果音：OFF',
      langSwitch: '言語切り替え',
    },
    mapDrawer: {
      title: '美術館フロアマップ',
      subtitle: '手描きのマップ上の部屋をクリックしてページめくりで移動',
      close: 'マップを閉じる',
      exploreRoom: '展示室へ入る',
    },
    notionModal: {
      title: 'Notion Headless CMS 連携設定',
      subtitle: 'Notion API を通じて工藝品と文献を動的に同期します',
      apiKeyLabel: 'Notion Integration Token (API Key)',
      craftsDbLabel: 'Crafts データベース ID',
      blogDbLabel: 'Blog データベース ID',
      saveButton: '保存して接続',
      statusConnected: 'ステータス：Notion DB 接続済み',
      statusDemoMode: 'ステータス：デモモード（館内蔵書を使用中）',
      setupGuideTitle: 'Notion 設定手順：',
      setupGuideSteps: [
        '1. notion.so/my-integrations で Integration を作成し Token を取得。',
        '2. Notion で Crafts と Blog DB を作成（Name, Category, Material, Era, Description, Date）。',
        '3. DB のメニュー (...) -> "Add connections" で作成した Integration を追加。',
        '4. DB ID を上記フォームに入力または .env に設定してください。',
      ],
    },
    craftsScene: {
      title: '工藝展示館 (Crafts Gallery)',
      subtitle: '左側の展示棚の作品をクリックすると右側に詳細が描かれます',
      cabinetTitle: '展示キャビネット',
      clickToInspect: '作品をクリックして詳細を鑑賞',
      filterAll: 'すべての工藝品',
      notionSourceBadge: 'データ元：Notion API',
      fallbackSourceBadge: 'データ元：館内コレクション',
      material: '材質技法',
      era: '制作年代',
      category: '分類',
    },
    blogScene: {
      title: '文献図書館 (Archives Library)',
      subtitle: '左側の本棚をクリックすると右側で文献を閲覧できます',
      bookshelfTitle: '収蔵本棚',
      articleCount: '収蔵数',
      readTime: '読了時間',
      author: '記録者',
      publishDate: '収蔵日',
      tags: 'タグ',
    },
    aboutScene: {
      title: '館長室と掲示板',
      subtitle: '手描き美術館の初心を感じ、落書き掲示板に思い出を残してください',
      curatorNote: '「一筆一筆に時間の刻印が宿る。ネオンを排し、鉛筆と紙の温もりを留めます。」',
      curatorBio: '館長手記：一點透視と非歪みキャンバス設計により、スマホからPCまで温もりのある画集を再現。',
      guestbookButton: 'スケッチ掲示板を開く',
      guestbookTitle: '館長室メッセージスケッチブック',
      guestbookSubtitle: '鉛筆を手にとって、自由なスケッチやサインを残してください：',
      clearCanvas: 'キャンバスを消去',
      saveDoodle: '保存する',
    },
    common: {
      close: '閉じる',
      inspect: '拡大鑑賞',
      backToHall: 'メインホールに戻る',
      loading: 'データを読み込み中...',
      error: '読み込みエラーが発生しました',
    },
  },
};
