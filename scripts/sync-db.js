import { list } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

// This script runs before vite build on Vercel to fetch the latest DB data
async function syncDb() {
  // If no BLOB token, we are likely local and not connected to blob, skip.
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.log('No BLOB_READ_WRITE_TOKEN found. Skipping DB sync.');
    return;
  }

  const types = ['artigos', 'projetos', 'vagas'];
  
  for (const type of types) {
    try {
      const { blobs } = await list({ prefix: `db/${type}.json` });
      if (blobs.length > 0) {
        blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        const response = await fetch(blobs[0].url);
        if (response.ok) {
          const data = await response.json();
          const targetPath = path.join(process.cwd(), `public/data/${type}.json`);
          fs.writeFileSync(targetPath, JSON.stringify(data, null, 2));
          console.log(`Synced ${type}.json from Blob to public/data/`);
        }
      } else {
        console.log(`No blob found for ${type}.json. Using local fallback.`);
      }
    } catch (error) {
      console.error(`Error syncing ${type}.json:`, error);
    }
  }
}

syncDb();
