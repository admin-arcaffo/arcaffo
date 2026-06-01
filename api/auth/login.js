const jwt = require('jsonwebtoken');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { username, password } = req.body;
    
    // In Vercel environment, we store the hashes of the credentials
    // For local dev, we provide a fallback hash for the default credentials
    // Default username hash: 4rc4ff0
    // Default password hash: Pvnm@5426
    const validUserHash = process.env.ADMIN_USERNAME || '13c9e3fa62615bc5c65dc48ab8d4e9f73111f1636c7cfccfa01ee63cb28cc887'; 
    const validPassHash = process.env.ADMIN_PASSWORD || '5a709bebd6b334beab2fce128de1610e1cb2ab84a1e944f77c8e29a982142278';

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
