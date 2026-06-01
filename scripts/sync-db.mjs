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
        const blobUrl = blobs[0].url;
        
        // For private blobs, try getDownloadUrl first, then direct fetch with token
        let data = null;
        
        try {
          const { getDownloadUrl } = await import('@vercel/blob');
          const downloadUrl = await getDownloadUrl(blobUrl);
          const response = await fetch(downloadUrl);
          if (response.ok) {
            data = await response.json();
          }
        } catch (e) {
          console.log(`getDownloadUrl failed for ${type}, trying direct fetch...`);
        }
        
        // Fallback: direct fetch with authorization header
        if (!data) {
          const response = await fetch(blobUrl, {
            headers: {
              'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
            }
          });
          if (response.ok) {
            data = await response.json();
          }
        }
        
        if (data) {
          const targetPath = path.join(process.cwd(), `public/data/${type}.json`);
          fs.writeFileSync(targetPath, JSON.stringify(data, null, 2));
          console.log(`✅ Synced ${type}.json from Blob (${data.length} items)`);
        } else {
          console.warn(`⚠️  Could not fetch ${type}.json from Blob. Using local fallback.`);
        }
      } else {
        console.log(`No blob found for ${type}.json. Using local fallback.`);
      }
    } catch (error) {
      console.error(`Error syncing ${type}.json:`, error.message);
    }
  }
}

syncDb();
