import { handleUpload } from '@vercel/blob/client';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // The client sends the JWT token as clientPayload
        // We verify it here instead of using verifyAuth (which reads Authorization header)
        if (!clientPayload) {
          throw new Error('Unauthorized: No token provided');
        }

        try {
          const secret = process.env.JWT_SECRET || 'fallback_secret_for_local_dev_only';
          jwt.verify(clientPayload, secret);
        } catch (e) {
          throw new Error('Unauthorized: Invalid token');
        }

        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'video/mp4'
          ],
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Upload completed:', blob.url);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(400).json({ error: error.message });
  }
}
