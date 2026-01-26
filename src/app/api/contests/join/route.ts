import { NextRequest, NextResponse } from 'next/server';
import { contestDb } from '@/lib/contestDb';
import { JoinContestRequest } from '@/lib/contest';

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

    // Mock user data (in production, get from auth session)
    const userId = 'user123';
    const username = 'John Doe';

    // Attempt to join contest
    const result = contestDb.joinContest(code, userId, username);

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
