import { verifyAuth } from '../utils/auth.mjs';
import { getDbData, saveDbData } from '../utils/blob.mjs';

export default async function handler(req, res) {
  // Verify authentication
  const auth = verifyAuth(req);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { slug } = req.query;

  if (req.method === 'GET') {
    const projetos = await getDbData('projetos');
    const projeto = projetos.find(p => p.slug === slug);
    
    if (!projeto) {
      return res.status(404).json({ error: 'Projeto not found' });
    }
    
    return res.status(200).json(projeto);
  }

  if (req.method === 'PUT') {
    const projetos = await getDbData('projetos');
    const index = projetos.findIndex(p => p.slug === slug);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Projeto not found' });
    }
    
    const updatedProjeto = { ...projetos[index], ...req.body, id: projetos[index].id };
    
    if (updatedProjeto.slug !== slug) {
      if (projetos.some(p => p.slug === updatedProjeto.slug)) {
        return res.status(400).json({ error: 'New slug already exists' });
      }
    }

    projetos[index] = updatedProjeto;
    await saveDbData('projetos', projetos);
    
    return res.status(200).json(updatedProjeto);
  }

  if (req.method === 'DELETE') {
    const projetos = await getDbData('projetos');
    const filtered = projetos.filter(p => p.slug !== slug);
    
    if (filtered.length === projetos.length) {
      return res.status(404).json({ error: 'Projeto not found' });
    }
    
    await saveDbData('projetos', filtered);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
