import crypto from 'crypto';
import { getDbData, saveDbData } from './utils/blob.mjs';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, email, phone, company, message, website } = req.body || {};

    // Honeypot: real visitors never see or fill this field.
    if (website) {
      return res.status(200).json({ success: true });
    }

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Informe seu nome.' });
    }
    if (!email || !isValidEmail(String(email).trim())) {
      return res.status(400).json({ error: 'Informe um e-mail válido.' });
    }
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Conte um pouco sobre o que você precisa.' });
    }

    const lead = {
      id: crypto.randomUUID(),
      name: String(name).trim().slice(0, 200),
      email: String(email).trim().slice(0, 200),
      phone: phone ? String(phone).trim().slice(0, 50) : '',
      company: company ? String(company).trim().slice(0, 200) : '',
      message: String(message).trim().slice(0, 5000),
      createdAt: new Date().toISOString(),
      source: req.headers.referer || 'contato.html',
    };

    const leads = await getDbData('leads');
    leads.push(lead);
    await saveDbData('leads', leads);

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('Contato API error:', error);
    return res.status(500).json({ error: 'Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.' });
  }
}
