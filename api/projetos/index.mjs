import { verifyAuth } from '../utils/auth.mjs';
import { getDbData, saveDbData } from '../utils/blob.mjs';
import crypto from 'crypto';

export default async function handler(req, res) {
  const auth = verifyAuth(req);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const projetos = await getDbData('projetos');
      const summary = projetos.map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        tags: p.tags,
        status: p.status || 'published',
        cover: p.cover
      }));
      return res.status(200).json(summary);
    }

    if (req.method === 'POST') {
      const projetos = await getDbData('projetos');
      const newProjeto = req.body;
      
      if (!newProjeto.id) {
        newProjeto.id = crypto.randomUUID();
      }
      newProjeto.createdAt = newProjeto.createdAt || new Date().toISOString();
      newProjeto.updatedAt = new Date().toISOString();
      
      if (projetos.some(p => p.slug === newProjeto.slug)) {
        return res.status(400).json({ error: 'Slug already exists' });
      }

      projetos.push(newProjeto);
      await saveDbData('projetos', projetos);
      
      return res.status(201).json(newProjeto);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Projetos API error:', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error.message });
  }
}
