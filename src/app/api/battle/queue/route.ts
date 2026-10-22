// POST /api/battle/queue   — join matchmaking queue
// DELETE /api/battle/queue — leave queue
// GET /api/battle/queue    — get my current queue entry + match (for polling)
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { queueDb, matchDb } from '@/lib/battleDb';
import { BattleLanguage } from '@/lib/battleTypes';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const language: BattleLanguage = ['python', 'cpp', 'java'].includes(body.language)
      ? body.language
      : 'python';

    // Get full user data for email
    const { userDb } = await import('@/lib/userDb');
    const fullUser = await userDb.getUserById(user.userId);

    const entry = await queueDb.joinQueue({
      userId: user.userId,
      username: user.username,
      email: fullUser?.email || user.email,
      language,
    });

    return NextResponse.json({ success: true, data: { entry } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const result = await queueDb.leaveQueue(user.userId);
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.reason }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    // Heartbeat
    await queueDb.heartbeat(user.userId);

    const entry = await queueDb.getMyEntry(user.userId);

    let match = null;
    if (entry?.status === 'MATCHED' || entry?.status === 'PLAYING') {
      match = await matchDb.getMatchForUser(user.userId);
    }

    // Also reconcile any expired matches on every poll
    await matchDb.reconcileExpiredMatches().catch(() => {});

    return NextResponse.json({ success: true, data: { entry, match } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
