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

async function main() {
  const apiKey = process.env.NOTION_API_KEY || process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!apiKey) {
    console.log('[fetch-notion] No NOTION_API_KEY provided in environment. Skipping Notion fetch and keeping fallback data.');
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

    if (databaseId) {
      console.log(`[fetch-notion] Querying database: ${databaseId}`);
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
          const errText = await res.text();
          throw new Error(`Database query failed (${res.status}): ${errText}`);
        }

        const data = await res.json();
        const pages = data.results || [];

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
    }

    console.log(`[fetch-notion] Successfully retrieved ${allCrafts.length} items from Notion.`);
    fs.writeFileSync(outputPath, JSON.stringify({ data: allCrafts, updatedAt: new Date().toISOString() }, null, 2), 'utf-8');
    console.log(`[fetch-notion] Saved data to ${outputPath}`);
  } catch (err) {
    console.error('[fetch-notion] Warning: Encountered error while fetching Notion:', err.message);
    if (!fs.existsSync(outputPath)) {
      fs.writeFileSync(outputPath, JSON.stringify({ data: [], updatedAt: new Date().toISOString() }, null, 2));
    }
  }
}

main();
