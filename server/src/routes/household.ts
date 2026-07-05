import crypto from 'node:crypto';
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireHousehold } from '../middleware/auth.js';

export const householdRouter = Router();

const SELF_COLOR = '#1D9E75';
const PARTNER_COLORS = ['#534AB7', '#3C3489', '#0C447C'];

function generateInviteCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

function deriveDisplayName(email: string): string {
  return email.split('@')[0];
}

function deriveInitials(name: string): string {
  return (
    name
      .split(/[.\s_-]+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'ME'
  );
}

/**
 * Runs once right after signup. Resolves which household this Supabase user
 * belongs to: an existing membership (idempotent — safe to call again), an
 * invite-code household, the legacy pre-auth household (only for the address
 * in LEGACY_HOUSEHOLD_OWNER_EMAIL, and only once), or a brand-new one.
 */
householdRouter.post('/join', async (req, res) => {
  if (!req.supabaseUserId || !req.userEmail) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const existing = await prisma.scorer.findUnique({ where: { supabaseUserId: req.supabaseUserId } });
  if (existing) {
    res.json({ householdId: existing.householdId, scorerId: existing.id, role: existing.role });
    return;
  }

  const name = deriveDisplayName(req.userEmail);
  const initials = deriveInitials(name);
  const { inviteCode } = req.body ?? {};

  if (inviteCode) {
    const household = await prisma.household.findUnique({
      where: { inviteCode: String(inviteCode).toUpperCase() },
      include: { members: true },
    });
    if (!household) {
      res.status(404).json({ error: 'Invite code not found' });
      return;
    }

    // Prefer claiming an unclaimed slot (e.g. the demo seed's placeholder "Morgan"
    // PARTNER row) over creating a new Scorer — only count claimed members toward
    // the two-person household limit.
    const claimedMembers = household.members.filter((m) => m.supabaseUserId !== null);
    const unclaimed =
      household.members.find((m) => m.role === 'PARTNER' && m.supabaseUserId === null) ??
      household.members.find((m) => m.role === 'SELF' && m.supabaseUserId === null);

    if (unclaimed) {
      const claimed = await prisma.scorer.update({
        where: { id: unclaimed.id },
        data: { supabaseUserId: req.supabaseUserId, contact: req.userEmail },
      });
      res.status(200).json({ householdId: claimed.householdId, scorerId: claimed.id, role: claimed.role });
      return;
    }

    if (claimedMembers.length >= 2) {
      res.status(409).json({ error: 'This household already has two members' });
      return;
    }

    const role = claimedMembers.some((m) => m.role === 'SELF') ? 'PARTNER' : 'SELF';
    const colorHex = role === 'SELF' ? SELF_COLOR : PARTNER_COLORS[Math.floor(Math.random() * PARTNER_COLORS.length)];
    const scorer = await prisma.scorer.create({
      data: { householdId: household.id, supabaseUserId: req.supabaseUserId, name, initials, colorHex, role, contact: req.userEmail },
    });
    res.status(201).json({ householdId: household.id, scorerId: scorer.id, role: scorer.role });
    return;
  }

  const ownerEmail = process.env.LEGACY_HOUSEHOLD_OWNER_EMAIL;
  const legacyCode = process.env.LEGACY_HOUSEHOLD_INVITE_CODE ?? 'HOME-OWNER';
  if (ownerEmail && req.userEmail.toLowerCase() === ownerEmail.toLowerCase()) {
    const legacyHousehold = await prisma.household.findUnique({ where: { inviteCode: legacyCode } });
    const unclaimedSelf = legacyHousehold
      ? await prisma.scorer.findFirst({ where: { householdId: legacyHousehold.id, role: 'SELF', supabaseUserId: null } })
      : null;
    if (unclaimedSelf) {
      const claimed = await prisma.scorer.update({
        where: { id: unclaimedSelf.id },
        data: { supabaseUserId: req.supabaseUserId, contact: req.userEmail },
      });
      res.status(200).json({ householdId: claimed.householdId, scorerId: claimed.id, role: claimed.role });
      return;
    }
  }

  const household = await prisma.household.create({ data: { inviteCode: generateInviteCode() } });
  const scorer = await prisma.scorer.create({
    data: { householdId: household.id, supabaseUserId: req.supabaseUserId, name, initials, colorHex: SELF_COLOR, role: 'SELF', contact: req.userEmail },
  });
  res.status(201).json({ householdId: household.id, scorerId: scorer.id, role: scorer.role });
});

householdRouter.get('/', requireHousehold, async (req, res) => {
  const household = await prisma.household.findUnique({
    where: { id: req.householdId },
    include: { members: true },
  });
  if (!household) {
    res.status(404).json({ error: 'Household not found' });
    return;
  }
  res.json({
    id: household.id,
    inviteCode: household.inviteCode,
    members: household.members.map((m) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      initials: m.initials,
      colorHex: m.colorHex,
      isYou: m.id === req.scorerId,
    })),
  });
});
