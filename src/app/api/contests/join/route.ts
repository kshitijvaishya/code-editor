import { NextRequest, NextResponse } from 'next/server';
import { contestDb } from '@/lib/contestDb';
import { JoinContestRequest } from '@/lib/contest';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body: JoinContestRequest = await request.json();
    const { joinCode } = body;

    // Validation
    if (!joinCode || !joinCode.trim()) {
      return NextResponse.json(
        { success: false, message: 'Join code is required' },
        { status: 400 }
      );
    }

    const code = joinCode.trim().toUpperCase();

    if (code.length !== 8) {
      return NextResponse.json(
        { success: false, message: 'Invalid join code format' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Attempt to join contest
    const result = await contestDb.joinContest(code, user.userId, user.username);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        contest: result.contest,
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error joining contest:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
