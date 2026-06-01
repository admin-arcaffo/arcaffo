import { verifyAuth } from './utils/auth.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = verifyAuth(req);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const deployHookUrl = process.env.DEPLOY_HOOK_URL;
  if (!deployHookUrl) {
    console.warn('DEPLOY_HOOK_URL env var not set. Cannot trigger rebuild.');
    return res.status(500).json({ error: 'Deploy hook not configured' });
  }

  try {
    const response = await fetch(deployHookUrl, { method: 'POST' });
    if (!response.ok) {
      throw new Error(`Failed to trigger deploy: ${response.statusText}`);
    }
    const data = await response.json();
    return res.status(200).json({ success: true, deployment: data });
  } catch (error) {
    console.error('Publish error:', error);
    return res.status(500).json({ error: error.message });
  }
}
