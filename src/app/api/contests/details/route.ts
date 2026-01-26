import { NextRequest, NextResponse } from 'next/server';
import { contestDb } from '@/lib/contestDb';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Get contest details including problems and submissions
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const contestId = searchParams.get('id');

    if (!contestId) {
      return NextResponse.json(
        { success: false, message: 'Contest ID is required' },
        { status: 400 }
      );
    }

    const contest = await contestDb.getContestById(contestId);
    if (!contest) {
      return NextResponse.json(
        { success: false, message: 'Contest not found' },
        { status: 404 }
      );
    }

    // Check if user is participant
    const isParticipant = contest.participants.some(p => p.userId === user.userId);
    if (!isParticipant) {
      return NextResponse.json(
        { success: false, message: 'You are not a participant in this contest' },
        { status: 403 }
      );
    }

    // Get user's submissions
    const userSubmissions = await contestDb.getContestSubmissions(contestId, user.userId);

    // Get leaderboard
    const leaderboard = await contestDb.getContestLeaderboard(contestId);

    return NextResponse.json({
      success: true,
      contest,
      userSubmissions,
      leaderboard,
    });
  } catch (error) {
    console.error('Error fetching contest details:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
