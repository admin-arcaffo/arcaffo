import jwt from 'jsonwebtoken';

export function verifyAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_local_dev_only');
    return decoded;
  } catch (err) {
    return false;
  }
}
