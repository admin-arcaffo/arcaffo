import { verifyAuth } from '../utils/auth.mjs';
import { getDbData, saveDbData } from '../utils/blob.mjs';

export default async function handler(req, res) {
  const auth = verifyAuth(req);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const data = await getDbData('site-content');
      return res.status(200).json(Array.isArray(data) ? {} : data);
    }

    if (req.method === 'PUT') {
      const existing = await getDbData('site-content');
      const base = Array.isArray(existing) ? {} : existing;
      const body = req.body || {};

      const merged = { ...base };
      for (const namespace of Object.keys(body)) {
        merged[namespace] = { ...(base[namespace] || {}), ...body[namespace] };
      }

      await saveDbData('site-content', merged);
      return res.status(200).json(merged);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Site-content API error:', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error.message });
  }
}
