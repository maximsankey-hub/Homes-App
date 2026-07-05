import type { IncomingMessage, ServerResponse } from 'node:http';

// TEMPORARY: wraps app module load in try/catch so init-time errors (bad env
// vars, Prisma engine load failures, etc.) surface in the response body
// instead of a generic Vercel crash page. Remove once the deploy is stable.
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const { app } = await import('../server/src/app.js');
    // @ts-expect-error - Express app is callable with (req, res)
    return app(req, res);
  } catch (err) {
    const message = err instanceof Error ? (err.stack ?? err.message) : String(err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'debug_init_failure', message }));
  }
}
