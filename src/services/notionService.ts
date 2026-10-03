/**
 * @file services/notionService.ts
 * @description Notion Headless CMS 資料擷取服務 (Notion API Client & Fallback Service)
 * 當使用者設定 Notion API Key 與 Database ID 時，自動與 Notion 同步；
 * 若未設定，則順暢回退至手繪博物館內建典藏資料 (Local Mock Collection)。
 */

import { CraftItem, BlogArticle, NotionConfig } from '../types';

// 內建展示用工藝品典藏 (Built-in Crafts Fallback Data)
export const MOCK_CRAFTS: CraftItem[] = [
  {
    id: 'craft-01',
    title: '羽毛鋼筆與黃銅墨水瓶 (Feather Quill & Brass Inkwell)',
    category: '館藏手繪器具',
    material: '大雁羽毛、壓花黃銅、古法墨汁',
    era: '1890 年代歐洲筆記本工作坊',
    description: '此件展品為創館時期館長隨手草繪的典藏鋼筆與黃銅墨水罐。精細的羽毛紋理與筆尖滲墨感，紀錄著手繪與文字交織的溫度。',
    sketchUrl: 'quill',
    featured: true,
  },
  {
    id: 'craft-02',
    title: '手搖單點透視繪圖儀 (Perspectograph Engine)',
    category: '黃銅透視儀器',
    material: '黃銅齒輪、胡桃木底座、刻度鋼尺',
    era: '1912 年古典建築設計師專用',
    description: '早期畫家與建築師用於繪製標準單點透視與對稱幾何圖案的機械輔助工具。輕搖手把即可於畫紙上導出精準的會聚焦點。',
    sketchUrl: 'perspectograph',
    featured: true,
  },
  {
    id: 'craft-03',
    title: '百年經典鉛筆削筆刀與炭筆盒 (Vintage Sharpener & Charcoal Box)',
    category: '文房素描工具',
    material: '鑄鐵旋鈕、橡木盒、高碳素描鉛筆',
    era: '1930 年代草圖美術室',
    description: '珍藏於展櫃深處的炭筆盒，裡面依然留有當年畫家臨摹透視畫廊時使用過半截的軟質炭筆與鐵質削筆刀。',
    sketchUrl: 'charcoal',
    featured: false,
  },
  {
    id: 'craft-04',
    title: '羊皮紙古典幾何羅盤 (Parchment Brass Compass)',
    category: '幾何測量道具',
    material: '精鋼針頭、熟黃銅關節、羊皮皮套',
    era: '1885 年博物學家探險筆記',
    description: '專為手繪繪本地圖所打造的圓規，關節處刻有細緻的防滑紋理，能精確劃出對稱畫廊的圓弧拱門。',
    sketchUrl: 'compass',
    featured: false,
  },
];

// 內建展示用文章典藏 (Built-in Archives Blog Fallback Data)
export const MOCK_BLOGS: BlogArticle[] = [
  {
    id: 'blog-01',
    title: '透視與紙張的交響：論對稱單點透視的視覺震撼',
    excerpt: '探討手繪繪本如何透過 symmetrical one-point perspective 解決裝置螢幕寬度拉伸的幾何問題...',
    content: `在這座手繪素描博物館中，建築與畫冊的邊界變得模糊。傳統網頁在面對不同螢幕比例時，往往因為圖片強制放大或變形而失去畫作原有的比例美感。

為了克服這一限制，本館設計了「對稱單點透視抗拉伸系統 (Symmetrical One-Point Perspective System)」。我們將整個展覽畫面拆解為左側透視牆、右側透視牆，以及中央可無限彈性延伸的銜接區。

不論您使用的是垂直持握的手機，還是超寬顯示螢幕，畫廊的消失點 (Vanishing Point) 都將完美收束於視野正中央，保持線條的精確與素描筆觸的質感。`,
    publishDate: '2026-08-01',
    author: '博物館建築師',
    tags: ['透視幾何', '視覺設計', '繪本構造'],
    readTime: '4 分鐘',
  },
  {
    id: 'blog-02',
    title: '雙緩衝繪本翻頁機制 (Double-Buffer Page Flip Engine) 實現紀錄',
    excerpt: '解析 PageFlipController 如何利用 Top-Layer、Next-Layer 與 3D Leaf 打造逼真的素描冊翻頁體驗...',
    content: `當點擊畫廊熱點 (Hotspots) 切換展區時，傳統的網頁跳頁會破壞沈浸感。

本館採用雙緩衝雙層渲染架構 (Double-Buffer System)：
1. Top Layer (CurrentPageLayer)：保持顯示當前展區畫面與熱點。
2. Bottom Layer (NextPageLayer)：預先載入並繪製目標展區。
3. Flipping Leaf (3D 轉軸頁面)：執行 180 度 rotateY 沿著左側夾脊翻轉。

這種架構確保動畫進行時不會產生流暢度卡頓或未載入圖塊，配合 Web Audio 合成的紙張摩擦聲，創造出宛如親手翻閱素描本的點觸質感。`,
    publishDate: '2026-08-05',
    author: '館長技術手記',
    tags: ['前端動力學', 'Framer Motion', '點觸遊戲'],
    readTime: '6 分鐘',
  },
  {
    id: 'blog-03',
    title: 'Notion 無頭內容管理系統 (Headless CMS) 串接指南',
    excerpt: '非技術人員如何透過 Notion API 即時新增工藝展品與典藏文章，無縫更新博物館內容...',
    content: `傳統網站更新內容往往需要重新修改程式碼與重新佈署。手繪素描博物館引進 Notion API 作為 Headless CMS，讓無程式背景的館長只需在 Notion 內新增表格資料與內文，即可透過前端同步呈現在工藝館與圖書館中。

詳細設定步驟請點擊頂端選單的「Notion CMS 設定」按鈕檢視繁體中文完整教學。`,
    publishDate: '2026-08-10',
    author: '博物館資訊組',
    tags: ['Notion API', 'CMS', '無程式碼'],
    readTime: '3 分鐘',
  },
];

/**
 * 擷取工藝展品資料 (Fetch Crafts Items from Notion or Fallback)
 */
export async function fetchCraftsFromNotion(config: NotionConfig): Promise<{ data: CraftItem[]; isFromNotion: boolean }> {
  if (!config.apiKey || !config.craftsDbId) {
    return { data: MOCK_CRAFTS, isFromNotion: false };
  }

  try {
    const res = await fetch(`/api/notion/crafts?apiKey=${encodeURIComponent(config.apiKey)}&dbId=${encodeURIComponent(config.craftsDbId)}`);
    if (!res.ok) {
      throw new Error(`Notion API returned HTTP ${res.status}`);
    }
    const json = await res.json();
    if (json.data && Array.isArray(json.data) && json.data.length > 0) {
      return { data: json.data, isFromNotion: true };
    }
  } catch (err) {
    console.warn('[Notion Service] 無法連線 Notion API，使用內建備用展品資料', err);
  }

  return { data: MOCK_CRAFTS, isFromNotion: false };
}

/**
 * 擷取文獻文章資料 (Fetch Blog Articles from Notion or Fallback)
 */
export async function fetchBlogsFromNotion(config: NotionConfig): Promise<{ data: BlogArticle[]; isFromNotion: boolean }> {
  if (!config.apiKey || !config.blogDbId) {
    return { data: MOCK_BLOGS, isFromNotion: false };
  }

  try {
    const res = await fetch(`/api/notion/blogs?apiKey=${encodeURIComponent(config.apiKey)}&dbId=${encodeURIComponent(config.blogDbId)}`);
    if (!res.ok) {
      throw new Error(`Notion API returned HTTP ${res.status}`);
    }
    const json = await res.json();
    if (json.data && Array.isArray(json.data) && json.data.length > 0) {
      return { data: json.data, isFromNotion: true };
    }
  } catch (err) {
    console.warn('[Notion Service] 無法連線 Notion API，使用內建備用文章資料', err);
  }

  return { data: MOCK_BLOGS, isFromNotion: false };
}
