import { list, put } from '@vercel/blob';

// The same sanitizeSlug from the backend
function sanitizeSlug(raw) {
  if (!raw) return '';
  try {
    raw = decodeURIComponent(raw);
  } catch (e) { }

  return raw
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function fixSlugs() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('Error: BLOB_READ_WRITE_TOKEN is not set.');
    console.log('Run this script as: env BLOB_READ_WRITE_TOKEN="your_token" node scripts/fix-slugs.mjs');
    process.exit(1);
  }

  const types = ['projetos', 'artigos', 'vagas'];

  for (const type of types) {
    console.log(`\nChecking ${type}...`);
    try {
      const { blobs } = await list({ prefix: `db/${type}.json` });
      if (blobs.length === 0) {
        console.log(`No blob found for ${type}.`);
        continue;
      }
      
      blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      const response = await fetch(blobs[0].url + '?ts=' + Date.now(), { cache: 'no-store' });
      if (!response.ok) {
        console.error(`Failed to fetch ${type}`);
        continue;
      }
      
      const items = await response.json();
      let changed = false;

      const newItems = items.map(item => {
        const newSlug = sanitizeSlug(item.slug);
        if (newSlug !== item.slug) {
          console.log(`- Fixed slug: '${item.slug}' -> '${newSlug}'`);
          changed = true;
          return { ...item, slug: newSlug };
        }
        return item;
      });

      if (changed) {
        console.log(`Saving updated ${type} to blob...`);
        await put(`db/${type}.json`, JSON.stringify(newItems, null, 2), {
          access: 'public',
          addRandomSuffix: false,
          allowOverwrite: true,
        });
        console.log(`✅ ${type} updated successfully.`);
      } else {
        console.log(`✅ ${type} already clean, no changes needed.`);
      }
    } catch (error) {
      console.error(`Error processing ${type}:`, error);
    }
  }
}

fixSlugs();
