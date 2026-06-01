import { put, list } from '@vercel/blob';

// We store our JSON "database" in Vercel Blob under a specific prefix
export async function getDbData(type) {
  try {
    const { blobs } = await list({ prefix: `db/${type}.json` });
    if (blobs.length > 0) {
      // Sort by uploadedAt descending to get the latest
      blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      const response = await fetch(blobs[0].url);
      if (response.ok) {
        return await response.json();
      }
    }
  } catch (error) {
    console.error(`Error fetching ${type} from blob:`, error);
  }
  
  // Fallback to local file if blob fails or doesn't exist yet
  // In Vercel serverless, we can read from the deployed files using a full URL
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173';
    const response = await fetch(`${baseUrl}/data/${type}.json`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.error(`Error fetching local fallback for ${type}:`, err);
  }
  return [];
}

export async function saveDbData(type, data) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = await put(`db/${type}.json`, jsonString, {
      access: 'public',
      addRandomSuffix: false, // Overwrite the same file to keep it clean
    });
    return blob;
  } catch (error) {
    console.error(`Error saving ${type} to blob:`, error);
    throw error;
  }
}
