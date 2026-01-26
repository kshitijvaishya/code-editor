import { NextRequest, NextResponse } from 'next/server';
import { contestDb } from '@/lib/contestDb';

export async function POST(request: NextRequest) {
  try {
    const { joinCode } = await request.json();

    if (!joinCode || !joinCode.trim()) {
      return NextResponse.json(
        { success: false, message: 'Join code is required' },
        { status: 400 }
      );
    }

    const code = joinCode.trim().toUpperCase();
    const contest = await contestDb.getContestByJoinCode(code);

    if (!contest) {
      return NextResponse.json(
        { success: false, message: 'Invalid join code' },
        { status: 404 }
      );
    }

    if (contest.status === 'ended') {
      return NextResponse.json(
        { success: false, message: 'Contest has ended' },
        { status: 400 }
      );
    }

    // Return minimal info (don't expose full contest details before joining)
    return NextResponse.json({
      success: true,
      valid: true,
      contestName: contest.name,
      status: contest.status,
    });
  } catch (error) {
    console.error('Error validating join code:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
