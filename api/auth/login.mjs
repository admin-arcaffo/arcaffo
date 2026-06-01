import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { username, password } = req.body;
    
    // In Vercel environment, we store the hashes of the credentials
    // Default username: 4rc4ff0 → SHA-256
    // Default password: Pvnm@5426 → SHA-256
    const validUserHash = process.env.ADMIN_USERNAME || 'ad556a3d8ecbe7fe21b80a174095edcc1944a3b7c5854b50d83380b0a221511f'; 
    const validPassHash = process.env.ADMIN_PASSWORD || '40dfbd16e4a1ef1c055c5027e8843b336d63b7cf9a98ea1fa3f9f19dffc04b86';

    if (username === validUserHash && password === validPassHash) {
      const secret = process.env.JWT_SECRET || 'fallback_secret_for_local_dev_only';
      const token = jwt.sign({ admin: true }, secret, { expiresIn: '8h' });
      return res.status(200).json({ token });
    } else {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
