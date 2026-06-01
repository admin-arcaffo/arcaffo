import { handleUpload } from '@vercel/blob/client';
import { verifyAuth } from './utils/auth.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        // Verify authentication before allowing upload
        const auth = verifyAuth(req);
        if (!auth) {
          throw new Error('Unauthorized');
        }

        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'video/mp4'
          ],
          // Optionally limit max file size here
          // maximumSizeInBytes: 10 * 1024 * 1024,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Optional: record the upload in your database
        console.log('Upload completed:', blob.url);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(400).json({ error: error.message });
  }
}
