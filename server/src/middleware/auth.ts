import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { supabase } from '../lib/supabase.js';

declare global {
  namespace Express {
    interface Request {
      supabaseUserId?: string;
      userEmail?: string;
      householdId?: string;
      scorerId?: string;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Missing Authorization header' });
    return;
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired session' });
    return;
  }

  req.supabaseUserId = data.user.id;
  req.userEmail = data.user.email ?? undefined;
  next();
}

export async function requireHousehold(req: Request, res: Response, next: NextFunction) {
  if (!req.supabaseUserId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const scorer = await prisma.scorer.findUnique({ where: { supabaseUserId: req.supabaseUserId } });
  if (!scorer) {
    res.status(409).json({ error: 'Account setup incomplete — call POST /household/join first' });
    return;
  }

  req.householdId = scorer.householdId;
  req.scorerId = scorer.id;
  next();
}
