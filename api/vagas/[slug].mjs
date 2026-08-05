import { verifyAuth } from '../utils/auth.mjs';
import { getDbData, saveDbData } from '../utils/blob.mjs';
import { sanitizeSlug } from '../utils/slug.mjs';

export default async function handler(req, res) {
  const auth = verifyAuth(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const slug = decodeURIComponent(req.query.slug);

  try {
    if (req.method === 'GET') {
      const vagas = await getDbData('vagas');
      const vaga = vagas.find(v => sanitizeSlug(v.slug) === sanitizeSlug(slug));
      if (!vaga) return res.status(404).json({ error: 'Vaga not found' });
      return res.status(200).json(vaga);
    }

    if (req.method === 'PUT') {
      const vagas = await getDbData('vagas');
      const index = vagas.findIndex(v => sanitizeSlug(v.slug) === sanitizeSlug(slug));
      if (index === -1) return res.status(404).json({ error: 'Vaga not found' });
      
      const updated = { ...vagas[index], ...req.body, id: vagas[index].id };
      if (updated.slug) updated.slug = sanitizeSlug(updated.slug);
      updated.updatedAt = new Date().toISOString();

      if (updated.slug !== slug && vagas.some(v => v.slug === updated.slug)) {
        return res.status(400).json({ error: 'New slug already exists' });
      }

      vagas[index] = updated;
      await saveDbData('vagas', vagas);
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const vagas = await getDbData('vagas');
      const filtered = vagas.filter(v => sanitizeSlug(v.slug) !== sanitizeSlug(slug));
      if (filtered.length === vagas.length) return res.status(404).json({ error: 'Vaga not found' });
      await saveDbData('vagas', filtered);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Vagas [slug] API error:', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error.message });
  }
}
