/**
 * Fetch Notion data at build time and save to public/notion-data.json
 * This enables GitHub Actions to build a 100% static site with live Notion data.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.resolve(__dirname, '../public/notion-data.json');

function extractId(input) {
  if (!input) return '';
  const trimmed = input.trim();
  const match = trimmed.match(/([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
  return match ? match[1].replace(/-/g, '') : trimmed;
}

async function main() {
  const apiKey = (process.env.NOTION_API_KEY || process.env.NOTION_TOKEN || '').trim();
  const rawDatabaseId = process.env.NOTION_DATABASE_ID || '';
  const databaseId = extractId(rawDatabaseId);

  if (!apiKey) {
    console.log('[fetch-notion] No NOTION_API_KEY provided in environment. Keeping fallback data.');
    if (!fs.existsSync(outputPath)) {
      fs.writeFileSync(outputPath, JSON.stringify({ data: [], updatedAt: new Date().toISOString() }, null, 2));
    }
    return;
  }

  console.log('[fetch-notion] Connecting to Notion API...');

  try {
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    };

    let allCrafts = [];
    let querySuccess = false;

    if (databaseId) {
      console.log(`[fetch-notion] Attempting to query database ID: ${databaseId}`);
      try {
        let hasMore = true;
        let startCursor = undefined;

        while (hasMore) {
          const body = { page_size: 100 };
          if (startCursor) body.start_cursor = startCursor;

          const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
          });

          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            console.warn(`[fetch-notion] Database query failed with status ${res.status}:`, errJson.message || errJson);
            break;
          }

          const data = await res.json();
          const pages = data.results || [];
          querySuccess = true;

          for (let i = 0; i < pages.length; i++) {
            const p = pages[i];
            const props = p.properties || {};

            const titleProp = Object.values(props).find(prop => prop.type === 'title');
            const title = titleProp?.title?.[0]?.plain_text || `作品 ${allCrafts.length + 1}`;

            const category =
              props.Category?.select?.name ||
              props.Category?.rich_text?.[0]?.plain_text ||
              props.Category?.name ||
              '皮格部區域 1';

            const description =
              props.Description?.rich_text?.map(r => r.plain_text).join('') ||
              props.Summary?.rich_text?.map(r => r.plain_text).join('') ||
              '';

            const date =
              props.Date?.date?.start ||
              props.Date?.rich_text?.[0]?.plain_text ||
              '2024';

            const tags =
              props.Tags?.multi_select?.map(t => t.name) ||
              props.Tags?.select?.name ? [props.Tags.select.name] : ['皮革', '手作'];

            const images = [];
            if (props.Files?.files) {
              for (const f of props.Files.files) {
                const url = f.file?.url || f.external?.url;
                if (url) images.push(url);
              }
            }
            if (props.Image?.files) {
              for (const f of props.Image.files) {
                const url = f.file?.url || f.external?.url;
                if (url) images.push(url);
              }
            }
            const imageUrl = images[0] || (p.cover?.file?.url || p.cover?.external?.url) || '';

            allCrafts.push({
              id: p.id,
              title,
              category,
              description,
              date,
              tags,
              images,
              imageUrl,
            });
          }

          hasMore = data.has_more;
          startCursor = data.next_cursor;
        }
      } catch (dbErr) {
        console.warn('[fetch-notion] Database query error:', dbErr.message);
      }
    }

    if (!querySuccess || allCrafts.length === 0) {
      console.log('[fetch-notion] Searching accessible workspace for pages/databases...');
      const searchRes = await fetch('https://api.notion.com/v1/search', {
        method: 'POST',
        headers,
        body: JSON.stringify({ page_size: 50 }),
      });

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const results = searchData.results || [];
        console.log(`[fetch-notion] Search found ${results.length} accessible items in workspace.`);

        for (const item of results) {
          if (item.object === 'database') {
            const dbQuery = await fetch(`https://api.notion.com/v1/databases/${item.id}/query`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ page_size: 30 }),
            });
            if (dbQuery.ok) {
              const dbData = await dbQuery.json();
              for (const dbPage of (dbData.results || [])) {
                const props = dbPage.properties || {};
                const titleProp = Object.values(props).find(prop => prop.type === 'title');
                const title = titleProp?.title?.[0]?.plain_text || '作品';
                const category = props.Category?.select?.name || props.Category?.rich_text?.[0]?.plain_text || '皮格部區域 1';
                const description = props.Description?.rich_text?.map(r => r.plain_text).join('') || '';
                const date = props.Date?.date?.start || '2024';
                const tags = props.Tags?.multi_select?.map(t => t.name) || ['皮革'];
                allCrafts.push({ id: dbPage.id, title, category, description, date, tags, images: [] });
              }
            }
          }
        }
      }
    }

    console.log(`[fetch-notion] Total retrieved crafts: ${allCrafts.length}`);
    fs.writeFileSync(outputPath, JSON.stringify({ data: allCrafts, updatedAt: new Date().toISOString() }, null, 2), 'utf-8');
    console.log(`[fetch-notion] Wrote output to ${outputPath}`);
  } catch (err) {
    console.error('[fetch-notion] Warning: Failed to fetch Notion:', err.message);
    if (!fs.existsSync(outputPath)) {
      fs.writeFileSync(outputPath, JSON.stringify({ data: [], updatedAt: new Date().toISOString() }, null, 2));
    }
  }
}

main();
