import { verifyAuth } from '../utils/auth.mjs';
import { getDbData, saveDbData } from '../utils/blob.mjs';

const ALLOWED_FIELDS = {
  home: new Set([
    'hero_title_lead',
    'hero_title_accent',
    'hero_subtitle',
    'hero_cta_primary_label',
    'hero_cta_primary_href',
    'hero_cta_secondary_label',
    'hero_cta_secondary_href',
    'philosophy_title',
    'ecosystem_title',
    'projects_title',
    'problem_solution_title',
  ]),
  global: new Set([
    'footer_tagline',
    'prefooter_title_lead',
    'prefooter_title_accent',
    'prefooter_body',
    'prefooter_cta_label',
    'prefooter_cta_href',
  ]),
};

const LINK_FIELDS = new Set([
  'hero_cta_primary_href',
  'hero_cta_secondary_href',
  'prefooter_cta_href',
]);

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isSafeLink(value) {
  if (!value) return true;
  if (/^(?:https?:\/\/|mailto:|tel:)/i.test(value)) return true;
  if (value.startsWith('#')) return true;
  return value.startsWith('/') && !value.startsWith('//');
}

function validateUpdate(body) {
  if (!isRecord(body)) return 'Conteúdo inválido.';

  for (const [namespace, values] of Object.entries(body)) {
    if (!ALLOWED_FIELDS[namespace] || !isRecord(values)) {
      return `Seção inválida: ${namespace}.`;
    }

    for (const [field, value] of Object.entries(values)) {
      if (!ALLOWED_FIELDS[namespace].has(field)) return `Campo inválido: ${field}.`;
      if (typeof value !== 'string') return `O campo ${field} deve ser um texto.`;
      if (value.length > (LINK_FIELDS.has(field) ? 2048 : 5000)) return `O campo ${field} é muito longo.`;
      if (LINK_FIELDS.has(field) && !isSafeLink(value.trim())) return `O link informado em ${field} não é permitido.`;
    }
  }

  return '';
}

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
      const validationError = validateUpdate(body);
      if (validationError) return res.status(400).json({ error: validationError });

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
