import { verifyAuth } from '../utils/auth.js';
import { getDbData, saveDbData } from '../utils/blob.js';

export default async function handler(req, res) {
  const auth = verifyAuth(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const { slug } = req.query;

  if (req.method === 'GET') {
    const vagas = await getDbData('vagas');
    const vaga = vagas.find(v => v.slug === slug);
    if (!vaga) return res.status(404).json({ error: 'Vaga not found' });
    return res.status(200).json(vaga);
  }

  if (req.method === 'PUT') {
    const vagas = await getDbData('vagas');
    const index = vagas.findIndex(v => v.slug === slug);
    if (index === -1) return res.status(404).json({ error: 'Vaga not found' });
    
    const updatedVaga = { ...vagas[index], ...req.body, id: vagas[index].id };
    
    if (updatedVaga.slug !== slug) {
      if (vagas.some(v => v.slug === updatedVaga.slug)) {
        return res.status(400).json({ error: 'New slug already exists' });
      }
    }

    vagas[index] = updatedVaga;
    await saveDbData('vagas', vagas);
    return res.status(200).json(updatedVaga);
  }

  if (req.method === 'DELETE') {
    const vagas = await getDbData('vagas');
    const filtered = vagas.filter(v => v.slug !== slug);
    if (filtered.length === vagas.length) return res.status(404).json({ error: 'Vaga not found' });
    
    await saveDbData('vagas', filtered);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
