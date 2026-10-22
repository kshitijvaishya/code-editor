// GET /api/battle/match?matchId=xxx   — get match state
// POST /api/battle/match               — actions: select-language, start-round1
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { matchDb } from '@/lib/battleDb';
import { BattleLanguage } from '@/lib/battleTypes';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const matchId = request.nextUrl.searchParams.get('matchId');

    let match;
    if (matchId) {
      match = await matchDb.getMatchById(matchId);
    } else {
      match = await matchDb.getMatchForUser(user.userId);
    }

    if (!match) return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 });

    // Verify the user belongs to this match
    if (match.player1.userId !== user.userId && match.player2.userId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Auto-reconcile expired deadlines on every poll
    await matchDb.reconcileExpiredMatches().catch(() => {});

    // Re-fetch after reconcile
    const fresh = await matchDb.getMatchById(match.matchId);
    return NextResponse.json({ success: true, data: { match: fresh } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { matchId, action, language } = body;

    if (!matchId) return NextResponse.json({ success: false, error: 'matchId required' }, { status: 400 });

    const match = await matchDb.getMatchById(matchId);
    if (!match) return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 });

    if (match.player1.userId !== user.userId && match.player2.userId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    if (action === 'select-language' && language) {
      const validLangs: BattleLanguage[] = ['python', 'cpp', 'java'];
      if (!validLangs.includes(language)) {
        return NextResponse.json({ success: false, error: 'Invalid language' }, { status: 400 });
      }
      await matchDb.saveLanguage(matchId, user.userId, language as BattleLanguage);
      return NextResponse.json({ success: true });
    }

    if (action === 'start-round1') {
      await matchDb.startRound1(matchId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
