import { put, list, getDownloadUrl } from '@vercel/blob';

// We store our JSON "database" in Vercel Blob under a specific prefix
export async function getDbData(type) {
  try {
    const { blobs } = await list({ prefix: `db/${type}.json` });
    if (blobs.length > 0) {
      // Sort by uploadedAt descending to get the latest
      blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      const blobUrl = blobs[0].url;
      
      // Try getDownloadUrl for private blobs
      try {
        const downloadUrl = await getDownloadUrl(blobUrl);
        const response = await fetch(downloadUrl);
        if (response.ok) {
          return await response.json();
        }
      } catch (e) {
        console.log(`getDownloadUrl failed for ${type}, trying direct fetch...`);
      }
      
      // Fallback: direct fetch with token in header
      try {
        const response = await fetch(blobUrl, {
          headers: {
            'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
          }
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (e2) {
        console.error(`Direct fetch also failed for ${type}:`, e2.message);
      }
    }
  } catch (error) {
    console.error(`Error fetching ${type} from blob:`, error.message);
  }
  
  // Fallback to local file if blob fails or doesn't exist yet
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173';
    const response = await fetch(`${baseUrl}/data/${type}.json`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.error(`Error fetching local fallback for ${type}:`, err.message);
  }
  return [];
}

export async function saveDbData(type, data) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = await put(`db/${type}.json`, jsonString, {
      access: 'private',
      addRandomSuffix: false,
    });
    return blob;
  } catch (error) {
    console.error(`Error saving ${type} to blob:`, error);
    throw error;
  }
}
