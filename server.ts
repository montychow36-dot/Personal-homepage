/**
 * @file server.ts
 * @description Express + Vite 全棧伺服器與 Notion API 代理伺服器
 * 處理 Notion Headless CMS 資料庫查詢代理，避免前端直連產生 CORS 跨域限制，
 * 並提供本地與生產環境 (Cloud Run) 之動態託管。
 */

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_NOTION_KEY = process.env.NOTION_API_KEY || 'ntn_y25286052118TLtNHaWve0R7ifPi1hlhiuNo90xGwou503';
const DEFAULT_NOTION_PAGE_ID = process.env.NOTION_DATABASE_ID || process.env.NOTION_CRAFTS_DB_ID || '3b9096b7741b800797bdfb17d93d1787';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 健康檢查端點 (Health check endpoint)
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  /**
   * Notion 搜尋端點 - 列出此 Integration 已被授權訪問的所有 Databases 與 Pages
   * GET /api/notion/search
   */
  app.get('/api/notion/search', async (req: Request, res: Response) => {
    try {
      const apiKey = (req.query.apiKey as string) || DEFAULT_NOTION_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: 'Missing Notion API Key' });
      }

      const notionRes = await fetch('https://api.notion.com/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!notionRes.ok) {
        const errorText = await notionRes.text();
        return res.status(notionRes.status).json({ error: 'Notion API error', details: errorText });
      }

      const data = await notionRes.json();
      return res.json({ results: data.results || [] });
    } catch (err: any) {
      console.error('[Server Error] Notion Search failed:', err);
      return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  });

  /**
   * Notion Crafts 資料庫代理查詢端點
   * GET /api/notion/crafts?apiKey=...&dbId=...
   */
  
// --- Cache System ---
let craftsCache = null;
let craftsCacheTime = 0;
let isFetchingCrafts = false;
let fetchCraftsPromise = null;

async function getCraftsData(apiKey) {
  const CACHE_TTL = 60 * 1000; // 1 minute
  if (craftsCache && (Date.now() - craftsCacheTime < CACHE_TTL)) {
    return craftsCache;
  }
  
  if (isFetchingCrafts) {
    return fetchCraftsPromise;
  }
  
  isFetchingCrafts = true;
  fetchCraftsPromise = (async () => {
    try {
      const searchRes = await fetch('https://api.notion.com/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filter: { property: 'object', value: 'page' }
        })
      });

      if (!searchRes.ok) throw new Error('Failed to search Notion workspace.');
      const searchData = await searchRes.json();
      const pages = searchData.results || [];
      const allCrafts = [];

      for (const page of pages) {
        const pageTitle = page.properties?.title?.title?.[0]?.plain_text || '未命名頁面';
        
        let blocks = [];
        let startCursor = undefined;
        do {
          const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${page.id}/children${startCursor ? `?start_cursor=${startCursor}` : ''}`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Notion-Version': '2022-06-28',
            }
          });
          if (!blocksRes.ok) break;
          const bData = await blocksRes.json();
          blocks = blocks.concat(bData.results || []);
          startCursor = bData.has_more ? bData.next_cursor : undefined;
        } while (startCursor);

        const childDbBlock = blocks.find((b) => b.type === 'child_database');
        if (childDbBlock) {
          const childDbQueryRes = await fetch(`https://api.notion.com/v1/databases/${childDbBlock.id}/query`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Notion-Version': '2022-06-28',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ page_size: 50 }),
          });
          if (childDbQueryRes.ok) {
            const childDbData = await childDbQueryRes.json();
            const crafts = (childDbData.results || []).map((dbPage, idx) => {
              const props = dbPage.properties || {};
              const titleProp = Object.values(props).find((p: any) => p?.type === 'title') as any;
              const title = titleProp?.title?.[0]?.plain_text || `作品 ${idx + 1}`;
              const category = props.Category?.select?.name || props.Category?.rich_text?.[0]?.plain_text || '皮格部區域 1';
              const description = props.Description?.rich_text?.map((r) => r.plain_text).join('') || '';
              const date = props.Date?.date?.start || props.Date?.rich_text?.[0]?.plain_text || '2024';
              const tags = props.Tags?.multi_select?.map((t) => t.name) || ['皮革', '手作'];
              return { id: dbPage.id, title, category, description, date, tags, images: [] };
            });
            allCrafts.push(...crafts);
          }
          continue;
        }

        const hasHeadings = blocks.some((b) => {
          const text = b[b.type]?.rich_text?.map((t) => t.plain_text).join('') || '';
          return text.trim().startsWith('###') || b.type.startsWith('heading_');
        });

        if (hasHeadings && pageTitle === 'Crafts Gallery') {
          let currentCraft = null;
          const initializeCraft = (title, id) => {
            if (currentCraft) allCrafts.push(currentCraft);
            currentCraft = { id, title, category: '其他', description: '', date: '2024', images: [], tags: [] };
          };

          for (const block of blocks) {
            if (block.type === 'image') {
              if (!currentCraft) initializeCraft('未命名', block.id);
              const img = block.image?.file?.url || block.image?.external?.url;
              if (img) currentCraft.images.push(img);
              continue;
            }
            const text = block[block.type]?.rich_text?.map((t) => t.plain_text).join('') || '';
            const trimmed = text.trim();
            if (!trimmed) continue;
            
            const lower = trimmed.toLowerCase();
            const isCategoryMarker = lower.startsWith('category') && (lower.includes(':') || lower.includes('：'));
            const isTitleMarker = trimmed.startsWith('###') || block.type.startsWith('heading_');

            if (isTitleMarker) {
              initializeCraft(trimmed.replace(/^#+\s*/, ''), block.id);
            } else if (isCategoryMarker) {
              if (!currentCraft) initializeCraft('未命名', block.id);
              const lines = trimmed.split('\n');
              currentCraft.category = lines[0].replace(/^category\s*[:：]\s*/i, '').trim() || '其他';
              if (lines.length > 1) {
                const rest = lines.slice(1).join('\n').trim();
                if (rest) currentCraft.description = currentCraft.description ? currentCraft.description + '\n' + rest : rest;
              }
            } else {
              if (!currentCraft) initializeCraft('未命名', block.id);
              if (lower.startsWith('description') && (lower.includes(':') || lower.includes('：'))) {
                currentCraft.description = trimmed.replace(/^description\s*[:：]\s*/i, '').trim();
              } else if (lower.startsWith('image') && (lower.includes(':') || lower.includes('：'))) {
                // ignore
              } else {
                currentCraft.description = currentCraft.description ? currentCraft.description + '\n' + trimmed : trimmed;
              }
            }
          }
          if (currentCraft && (currentCraft.title !== '未命名' || currentCraft.images.length > 0)) {
            allCrafts.push(currentCraft);
          }
        } else {
          const craft = {
            id: page.id,
            title: pageTitle,
            category: '其他',
            description: '',
            date: '2024',
            images: [],
            pages: {},
            tags: []
          };
          
          let currentPageKey = null;

          for (const block of blocks) {
            const text = block[block.type]?.rich_text?.map((t) => t.plain_text).join('') || '';
            const trimmed = text.trim();
            const lower = trimmed.toLowerCase();

            if (lower.startsWith('page:') || lower.startsWith('page：')) {
              const pageNumStr = lower.split(/[:：]/)[1].trim();
              const pageNum = parseInt(pageNumStr, 10);
              if (!isNaN(pageNum)) {
                currentPageKey = pageNum;
                if (!craft.pages[currentPageKey]) craft.pages[currentPageKey] = [];
              }
            } else if (lower.startsWith('photo:') || lower.startsWith('photo：')) { 
               craft.title = text.substring(6).trim();
               craft.category = 'photo';
            } else if (lower.startsWith('article:') || lower.startsWith('article：')) {
               let raw = text.substring(8).trim();
               let titleLines = raw.split('\n');
               let titleLine = titleLines[0].trim();
               if (titleLine.startsWith('###')) {
                   titleLine = titleLine.replace(/^###\s*/, '');
               }
               if (titleLine) craft.title = titleLine;
               craft.category = 'article';
            } else if (trimmed.startsWith('###')) {
               if (craft.title === craft.id || craft.title.toLowerCase() === 'article' || craft.title === pageTitle) {
                   craft.title = trimmed.split('\n')[0].replace(/^###\s*/, '').trim();
               }
               craft.category = 'article'; // If it has a heading, assume it's an article unless explicitly categorised
            }

            if (block.type === 'image') {
              const img = block.image?.file?.url || block.image?.external?.url;
              if (img) {
                craft.images.push(img);
                if (currentPageKey !== null) {
                  craft.pages[currentPageKey].push(img);
                }
              }
            } else if (lower.startsWith('description') && (lower.includes(':') || lower.includes('：'))) {
              craft.description = trimmed.replace(/^description\s*[:：]\s*/i, '').trim();
            } else if (lower.startsWith('category') && (lower.includes(':') || lower.includes('：'))) {
              const cat = trimmed.replace(/^category\s*[:：]\s*/i, '').trim();
              if (cat) craft.category = cat;
            } else {
              if (text) {
                craft.description = craft.description ? craft.description + '\n' + trimmed : trimmed;
              }
            }
          }
          if (craft.images.length > 0 || craft.description) {
            allCrafts.push(craft);
          }
        }
      }
      
      craftsCache = allCrafts;
      craftsCacheTime = Date.now();
      return allCrafts;
    } finally {
      isFetchingCrafts = false;
      fetchCraftsPromise = null;
    }
  })();
  return fetchCraftsPromise;
}

  /**
   * Notion Crafts 目錄代理查詢端點 (Catalog - Lazy Loading)
   * 只回傳清單，不包含大型描述與圖片陣列
   */
  app.get('/api/notion/crafts', async (req: Request, res: Response) => {
    try {
      const apiKey = (req.query.apiKey as string) || DEFAULT_NOTION_KEY;
      const allCrafts = await getCraftsData(apiKey);
      
      // 只回傳輕量化的目錄資訊
      const catalog = allCrafts.map(c => ({
        id: c.id,
        title: c.title,
        category: c.category,
        date: c.date,
        tags: c.tags,
        imageUrl: c.images?.[0] || '', // 只取第一張圖作為縮圖
        images: [], // 清空圖片陣列，留到點擊時才載入
        imageCount: c.images?.length || 0, // 加入圖片總數
        description: '', // 清空描述
        pages: c.pages ? Object.keys(c.pages).reduce((acc, key) => ({...acc, [key]: []}), {}) : {}
      }));
      
      return res.json({ data: catalog, source: 'workspace_search' });
    } catch (err: any) {
      console.error('[Server Error] Notion Crafts API failed:', err);
      return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  });

  /**
   * Notion Crafts 單一作品詳細資料端點 (Details - On Demand)
   */
  app.get('/api/notion/crafts/:id', async (req: Request, res: Response) => {
    try {
      const apiKey = (req.query.apiKey as string) || DEFAULT_NOTION_KEY;
      const id = req.params.id;
      const allCrafts = await getCraftsData(apiKey);
      
      const craft = allCrafts.find(c => c.id === id);
      if (!craft) {
        return res.status(404).json({ error: 'Craft not found' });
      }
      
      return res.json({ data: craft });
    } catch (err: any) {
      console.error('[Server Error] Notion Craft Detail API failed:', err);
      return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  });

app.get('/api/notion/blogs', async (req: Request, res: Response) => {
    try {
      const apiKey = (req.query.apiKey as string) || DEFAULT_NOTION_KEY;
      const dbId = (req.query.dbId as string) || process.env.NOTION_BLOG_DB_ID || process.env.NOTION_DATABASE_ID;

      if (!apiKey || !dbId) {
        return res.status(400).json({ error: 'Missing Notion API Key or Database ID' });
      }

      const notionRes = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page_size: 20 }),
      });

      if (!notionRes.ok) {
        const errorText = await notionRes.text();
        return res.status(notionRes.status).json({ error: 'Notion API error', details: errorText });
      }

      const notionData = await notionRes.json();

      const blogs = (notionData.results || []).filter((page: any) => {
        const props = page.properties || {};
        const typeProp = props.Type || props['類型'] || props.Section || props['分類'];
        const typeStr = (typeProp?.select?.name || typeProp?.rich_text?.[0]?.plain_text || '').toLowerCase();
        
        // 只有明確標示為「文章」的才會出現在這裡
        if (typeStr.includes('文章') || typeStr.includes('article') || typeStr.includes('blog')) return true;
        return false;
      }).map((page: any, idx: number) => {
        const props = page.properties || {};
        return {
          id: page.id || `notion-blog-${idx}`,
          title: props.Name?.title?.[0]?.plain_text || props.Title?.title?.[0]?.plain_text || '未命名文獻',
          excerpt: props.Excerpt?.rich_text?.[0]?.plain_text || props.Description?.rich_text?.[0]?.plain_text || '點擊閱讀來自 Notion CMS 的完整內容...',
          content: props.Content?.rich_text?.[0]?.plain_text || '本篇文獻典藏於 Notion 資料庫，提供無頭 CMS 即時內容管理。',
          publishDate: props.Date?.date?.start || new Date().toISOString().split('T')[0],
          author: props.Author?.rich_text?.[0]?.plain_text || 'Notion 編輯員',
          tags: props.Tags?.multi_select?.map((t: any) => t.name) || ['Notion文章'],
          readTime: '3 分鐘',
          notionId: page.id,
        };
      });

      return res.json({ data: blogs });
    } catch (err: any) {
      console.error('[Server Error] Notion Blogs API failed:', err);
      return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  });

  /**
   * Notion Photos 資料庫代理查詢端點
   * GET /api/notion/photos?apiKey=...&dbId=...
   */
  app.get('/api/notion/photos', async (req: Request, res: Response) => {
    try {
      const apiKey = (req.query.apiKey as string) || DEFAULT_NOTION_KEY;
      const dbId = (req.query.dbId as string) || process.env.NOTION_PHOTO_DB_ID || process.env.NOTION_BLOG_DB_ID || process.env.NOTION_DATABASE_ID;

      if (!apiKey || !dbId) {
        return res.status(400).json({ error: 'Missing Notion API Key or Database ID' });
      }

      const notionRes = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page_size: 50 }),
      });

      if (!notionRes.ok) {
        const errorText = await notionRes.text();
        return res.status(notionRes.status).json({ error: 'Notion API error', details: errorText });
      }

      const notionData = await notionRes.json();

      const photos = (notionData.results || []).filter((page: any) => {
        const props = page.properties || {};
        const typeProp = props.Type || props['類型'] || props.Section || props['分類'] || props.Tags || props.Category;
        const typeStr = (typeProp?.select?.name || typeProp?.rich_text?.[0]?.plain_text || typeProp?.multi_select?.[0]?.name || '').toLowerCase();
        
        // 如果是文章，就跳過
        if (typeStr.includes('文章') || typeStr.includes('article') || typeStr.includes('blog')) return false;
        
        return true;
      }).map((page: any, idx: number) => {
        const props = page.properties || {};
        const title = props.Name?.title?.[0]?.plain_text || props.Title?.title?.[0]?.plain_text || '未命名相片';
        
        const typeProp = props.Type || props['類型'] || props.Section || props['分類'] || props.Tags || props.Category || props.Location;
        const category = typeProp?.select?.name || typeProp?.multi_select?.[0]?.name || typeProp?.rich_text?.[0]?.plain_text || '未分類相片';

        return {
          id: page.id || `notion-photo-${idx}`,
          title: title,
          category: category,
          excerpt: props.Excerpt?.rich_text?.[0]?.plain_text || props.Description?.rich_text?.[0]?.plain_text || '',
          imageUrl: props.Image?.files?.[0]?.file?.url || props.Image?.files?.[0]?.external?.url || '',
          publishDate: props.Date?.date?.start || new Date().toISOString().split('T')[0],
          notionId: page.id,
        };
      });

      return res.json({ data: photos });
    } catch (err: any) {
      console.error('[Server Error] Notion Photos API failed:', err);
      return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  });

  // 開發環境掛載 Vite 中間件；生產環境服務靜態檔案
  app.get('/api/notion/page_info', async (req: Request, res: Response) => {
    try {
      const apiKey = (req.query.apiKey as string) || process.env.NOTION_SECRET || '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';
      const dbId = (req.query.dbId as string) || process.env.NOTION_DATABASE_ID || process.env.NOTION_CRAFTS_DB_ID || '3b9096b7741b800797bdfb17d93d1787';
      
      const response = await fetch(`https://api.notion.com/v1/pages/${dbId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28'
        }
      });
      const data = await response.json();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({error: e.message});
    }
  });

  app.get('/api/notion/env', (req, res) => {
    res.json({
      NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
      NOTION_CRAFTS_DB_ID: process.env.NOTION_CRAFTS_DB_ID,
      NOTION_BLOG_DB_ID: process.env.NOTION_BLOG_DB_ID,
      NODE_ENV: process.env.NODE_ENV
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sketch Museum Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
