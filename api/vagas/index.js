import { verifyAuth } from '../utils/auth.js';
import { getDbData, saveDbData } from '../utils/blob.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  const auth = verifyAuth(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const vagas = await getDbData('vagas');
    return res.status(200).json(vagas);
  }

  if (req.method === 'POST') {
    const vagas = await getDbData('vagas');
    const novaVaga = req.body;
    
    if (!novaVaga.id) {
      novaVaga.id = crypto.randomUUID();
    }
    
    if (vagas.some(v => v.slug === novaVaga.slug)) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    vagas.push(novaVaga);
    await saveDbData('vagas', vagas);
    
    return res.status(201).json(novaVaga);
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
