import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import healthHandler from './api/health';
import analyzeBillHandler from './api/analyze-bill';
import generateTipsHandler from './api/generate-tips';

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '16mb' }));

  // Local dev adapter forwarding /api/* to the Vercel serverless function handlers
  app.all('/api/health', (req: Request, res: Response) => healthHandler(req, res));
  app.all('/api/analyze-bill', (req: Request, res: Response) => analyzeBillHandler(req, res));
  app.all('/api/generate-tips', (req: Request, res: Response) => generateTipsHandler(req, res));

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WattWise local server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
