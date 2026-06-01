import { verifyAuth } from '../utils/auth.js';
import { getDbData, saveDbData } from '../utils/blob.js';

export default async function handler(req, res) {
  // Verify authentication
  const auth = verifyAuth(req);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { slug } = req.query;

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
    
    // Update the item but keep its original ID
    const updatedArtigo = { ...artigos[index], ...req.body, id: artigos[index].id };
    
    // If slug changed, ensure no collision with other items
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
}
