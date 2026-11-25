import { ApiRequest, ApiResponse } from './_lib/gemini';

export default function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader?.('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.status(200).json({
    ok: true,
    runtime: 'vercel-serverless',
  });
}
