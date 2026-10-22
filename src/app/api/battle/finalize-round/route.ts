// POST /api/battle/finalize-round  — finalize a round (player-triggered or deadline)
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { matchDb } from '@/lib/battleDb';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { matchId, round } = body;

    if (!matchId || !round) {
      return NextResponse.json({ success: false, error: 'matchId and round required' }, { status: 400 });
    }

    const match = await matchDb.getMatchById(matchId);
    if (!match) return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 });

    if (match.player1.userId !== user.userId && match.player2.userId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    if (round === 'round1') {
      if (!match.round1Finalized) {
        await matchDb.finalizeRound1(matchId);
        await matchDb.startRound2(matchId);
      }
    } else if (round === 'round2') {
      if (!match.round2Finalized) {
        await matchDb.finalizeRound2(matchId);
      }
    }

    const updated = await matchDb.getMatchById(matchId);
    return NextResponse.json({ success: true, data: { match: updated } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
