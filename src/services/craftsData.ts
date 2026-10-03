import { getAssetUrl } from '../utils/assets';

/**
 * Fetch crafts data seamlessly across both local development (Express API)
 * and GitHub Pages (pre-generated static notion-data.json).
 */
export async function fetchCraftsData(): Promise<any[]> {
  // 1. Try local dev server endpoint first
  try {
    const res = await fetch('/api/notion/crafts');
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (err) {
    // Expected in static environment
  }

  // 2. Try static pre-generated notion-data.json (for GitHub Pages)
  try {
    const staticUrl = getAssetUrl('notion-data.json');
    const staticRes = await fetch(staticUrl);
    if (staticRes.ok) {
      const json = await staticRes.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (err) {
    // Ignore and fallback
  }

  return [];
}
