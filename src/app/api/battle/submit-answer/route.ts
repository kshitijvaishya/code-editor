// POST /api/battle/submit-answer  — submit an MCQ answer (round 1)
// GET  /api/battle/submit-answer  — get my existing answers for a match
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { matchDb, submissionDb } from '@/lib/battleDb';
import { getMCQsForLanguage } from '@/lib/battleQuestions';
import { BattleLanguage } from '@/lib/battleTypes';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { matchId, questionId, selectedIndex, language } = body;

    if (!matchId || questionId === undefined || selectedIndex === undefined) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const match = await matchDb.getMatchById(matchId);
    if (!match) return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 });

    if (match.player1.userId !== user.userId && match.player2.userId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    if (match.status !== 'ROUND1') {
      return NextResponse.json({ success: false, error: 'Not in Round 1' }, { status: 400 });
    }

    // Server-side deadline check
    if (match.round1DeadlineAt && new Date(match.round1DeadlineAt).getTime() < Date.now()) {
      return NextResponse.json({ success: false, error: 'Round 1 deadline has passed' }, { status: 400 });
    }

    // Determine player's language
    const playerLang: BattleLanguage =
      match.player1.userId === user.userId
        ? (match.player1.language || 'python')
        : (match.player2.language || 'python');

    const langToUse: BattleLanguage = language || playerLang;
    const questions = getMCQsForLanguage(langToUse);
    const question = questions.find(q => q.questionId === questionId);

    if (!question) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    const isCorrect = question.correctIndex === selectedIndex;
    const score = isCorrect ? question.points : 0;

    const submissionId = await submissionDb.saveMCQ({
      matchId,
      userId: user.userId,
      questionId,
      roundType: 'round1',
      selectedIndex,
      isCorrect,
      score,
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: { submissionId, isCorrect, score } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const matchId = request.nextUrl.searchParams.get('matchId');
    if (!matchId) return NextResponse.json({ success: false, error: 'matchId required' }, { status: 400 });

    const subs = await submissionDb.getForMatch(matchId, user.userId, 'round1');
    return NextResponse.json({ success: true, data: { submissions: subs } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
