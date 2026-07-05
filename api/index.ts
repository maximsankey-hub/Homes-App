import type { IncomingMessage, ServerResponse } from 'node:http';

// Deliberately dynamic: a static import here lets Vercel's bundler inline
// server/src/app.ts (and its Prisma dependency chain) into this function's
// single bundle, which breaks Prisma's runtime lookup of its query-engine
// binary (it expects the original node_modules/.prisma/client layout).
// Keeping this import dynamic leaves that module as a separate chunk that
// preserves the directory structure vercel.json's includeFiles ships.
let appPromise: ReturnType<typeof loadApp> | undefined;

function loadApp() {
  return import('../server/src/app.js').then((m) => m.app);
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    appPromise ??= loadApp();
    const app = await appPromise;
    // @ts-expect-error - Express app is callable with (req, res)
    return app(req, res);
  } catch (err) {
    console.error('Server init failed:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
