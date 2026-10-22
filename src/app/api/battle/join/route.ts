// POST /api/battle/join — legacy endpoint, redirects to new queue API
// This is kept for backward-compat with the old queue page
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { queueDb, matchDb } from '@/lib/battleDb';
import { BattleLanguage } from '@/lib/battleTypes';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const language: BattleLanguage = ['python', 'cpp', 'java'].includes(body.language)
      ? body.language
      : 'python';

    const { userDb } = await import('@/lib/userDb');
    const fullUser = await userDb.getUserById(user.userId);

    const entry = await queueDb.joinQueue({
      userId: user.userId,
      username: user.username,
      email: fullUser?.email || '',
      language,
    });

    return NextResponse.json({ success: true, data: { entry } });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to join';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const matchId = request.nextUrl.searchParams.get('matchId');
    if (matchId) {
      const match = await matchDb.getMatchById(matchId);
      return NextResponse.json({ success: !!match, data: { match } });
    }

    await queueDb.heartbeat(user.userId);
    const entry = await queueDb.getMyEntry(user.userId);
    let match = null;
    if (entry?.matchId) {
      match = await matchDb.getMatchById(entry.matchId);
    }

    return NextResponse.json({ success: true, data: { entry, match } });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
