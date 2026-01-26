import { NextRequest, NextResponse } from 'next/server';
import { contestDb } from '@/lib/contestDb';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
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

    // Get contest to verify ownership
    const contest = await contestDb.getContestById(contestId);
    if (!contest) {
      return NextResponse.json(
        { success: false, message: 'Contest not found' },
        { status: 404 }
      );
    }

    // Only creator can delete
    if (contest.creatorId !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Only the contest creator can delete this contest' },
        { status: 403 }
      );
    }

    // Delete the contest
    await contestDb.deleteContest(contestId);

    return NextResponse.json({
      success: true,
      message: 'Contest deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting contest:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
