// GET  /api/battle/admin           — dashboard data
// POST /api/battle/admin           — admin actions (create-match, start-match, cancel-match, remove-queue)
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { adminDb, matchDb, queueDb } from '@/lib/battleDb';

export const dynamic = 'force-dynamic';

async function requireAdmin(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return { user: null, error: 'Unauthorized', status: 401 };

  const isAdm = await adminDb.isAdmin(user.userId);
  if (!isAdm) return { user: null, error: 'Forbidden — admin only', status: 403 };

  return { user, error: null, status: 200 };
}

export async function GET(request: NextRequest) {
  const { user, error, status } = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, error }, { status });

  try {
    const data = await adminDb.getDashboardData();
    return NextResponse.json({ success: true, data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, error, status } = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, error }, { status });

  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'create-match') {
      // Select exactly two QUEUED players
      const { player1Id, player2Id, groupLabel } = body;
      if (!player1Id || !player2Id) {
        return NextResponse.json({ success: false, error: 'player1Id and player2Id required' }, { status: 400 });
      }
      const match = await matchDb.createMatch(player1Id, player2Id, user.userId, groupLabel);
      return NextResponse.json({ success: true, data: { match } });
    }

    if (action === 'start-match') {
      const { matchId } = body;
      if (!matchId) return NextResponse.json({ success: false, error: 'matchId required' }, { status: 400 });
      const match = await matchDb.adminStartMatch(matchId);
      if (!match) return NextResponse.json({ success: false, error: 'Cannot start match in current state' }, { status: 400 });
      return NextResponse.json({ success: true, data: { match } });
    }

    if (action === 'cancel-match') {
      const { matchId, reason } = body;
      if (!matchId) return NextResponse.json({ success: false, error: 'matchId required' }, { status: 400 });
      const ok = await matchDb.cancelMatch(matchId, user.userId, reason || 'Cancelled by admin');
      return NextResponse.json({ success: ok, error: ok ? undefined : 'Cannot cancel match' });
    }

    if (action === 'remove-queue') {
      const { queueId } = body;
      if (!queueId) return NextResponse.json({ success: false, error: 'queueId required' }, { status: 400 });
      const ok = await queueDb.removeEntry(queueId);
      return NextResponse.json({ success: ok, error: ok ? undefined : 'Cannot remove entry' });
    }

    if (action === 'reconcile') {
      await matchDb.reconcileExpiredMatches();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
