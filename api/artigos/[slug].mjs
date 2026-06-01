import { verifyAuth } from '../utils/auth.mjs';
import { getDbData, saveDbData } from '../utils/blob.mjs';

export default async function handler(req, res) {
  const auth = verifyAuth(req);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { slug } = req.query;

  try {
    if (req.method === 'GET') {
      const artigos = await getDbData('artigos');
      const artigo = artigos.find(a => a.slug === slug);
      
      if (!artigo) {
        return res.status(404).json({ error: 'Artigo not found' });
      }
      
      return res.status(200).json(artigo);
    }

    if (req.method === 'PUT') {
      const artigos = await getDbData('artigos');
      const index = artigos.findIndex(a => a.slug === slug);
      
      if (index === -1) {
        return res.status(404).json({ error: 'Artigo not found' });
      }
      
      const updatedArtigo = { ...artigos[index], ...req.body, id: artigos[index].id };
      updatedArtigo.updatedAt = new Date().toISOString();
      
      if (updatedArtigo.slug !== slug) {
        if (artigos.some(a => a.slug === updatedArtigo.slug)) {
          return res.status(400).json({ error: 'New slug already exists' });
        }
      }

      artigos[index] = updatedArtigo;
      await saveDbData('artigos', artigos);
      
      return res.status(200).json(updatedArtigo);
    }

    if (req.method === 'DELETE') {
      const artigos = await getDbData('artigos');
      const filtered = artigos.filter(a => a.slug !== slug);
      
      if (filtered.length === artigos.length) {
        return res.status(404).json({ error: 'Artigo not found' });
      }
      
      await saveDbData('artigos', filtered);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Artigos [slug] API error:', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error.message });
  }
}
