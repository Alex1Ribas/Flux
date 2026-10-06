import type { RequestHandler } from 'express';
import { env } from '../../configurations/env/env.config.js';

interface IRateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, IRateLimitEntry>();

export function createRateLimitMiddleware(): RequestHandler {
  const windowMs = env.RATE_LIMIT_WINDOW_MS;
  const max = env.RATE_LIMIT_MAX;

  return (req, res, next) => {
    const key = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now >= entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (entry.count >= max) {
      res.status(429).json({ message: 'Muitas tentativas. Tente novamente em alguns minutos.' });
      return;
    }

    entry.count += 1;
    next();
  };
}
