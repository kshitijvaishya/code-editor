// GET /api/battle/leaderboard?matchId=xxx
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { leaderboardDb } from '@/lib/battleDb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const matchId = request.nextUrl.searchParams.get('matchId');
    if (!matchId) return NextResponse.json({ success: false, error: 'matchId required' }, { status: 400 });

    const data = await leaderboardDb.getMatchLeaderboard(matchId);
    if (!data) return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 });

    // Ensure user is a participant
    if (
      data.match.player1.userId !== user.userId &&
      data.match.player2.userId !== user.userId
    ) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
