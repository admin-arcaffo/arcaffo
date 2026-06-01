import { verifyAuth } from '../utils/auth.mjs';
import { getDbData, saveDbData } from '../utils/blob.mjs';
import crypto from 'crypto';

export default async function handler(req, res) {
  // Verify authentication
  const auth = verifyAuth(req);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const artigos = await getDbData('artigos');
      // Return summary for list view
      const summary = artigos.map(a => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        date: a.date,
        status: a.status || 'published',
        cover: a.cover
      }));
      return res.status(200).json(summary);
    }

    if (req.method === 'POST') {
      const artigos = await getDbData('artigos');
      const newArtigo = req.body;
      
      // Auto-generate ID if missing
      if (!newArtigo.id) {
        newArtigo.id = crypto.randomUUID();
      }

      // Set timestamps
      newArtigo.createdAt = newArtigo.createdAt || new Date().toISOString();
      newArtigo.updatedAt = new Date().toISOString();
      
      // Check for duplicate slug
      if (artigos.some(a => a.slug === newArtigo.slug)) {
        return res.status(400).json({ error: 'Slug already exists' });
      }

      artigos.push(newArtigo);
      await saveDbData('artigos', artigos);
      
      return res.status(201).json(newArtigo);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Artigos API error:', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error.message });
  }
}
