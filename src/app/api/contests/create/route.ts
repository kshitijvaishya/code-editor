import { NextRequest, NextResponse } from 'next/server';
import { contestDb } from '@/lib/contestDb';
import { CreateContestRequest } from '@/lib/contest';

export async function POST(request: NextRequest) {
  try {
    const body: CreateContestRequest = await request.json();
    const { name, startTime, endTime } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Contest name is required' },
        { status: 400 }
      );
    }

    if (!startTime || !endTime) {
      return NextResponse.json(
        { success: false, message: 'Start time and end time are required' },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { success: false, message: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (start <= now) {
      return NextResponse.json(
        { success: false, message: 'Start time must be in the future' },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        { success: false, message: 'End time must be after start time' },
        { status: 400 }
      );
    }

    // Mock user ID (in production, get from auth session)
    const creatorId = 'user123';

    // Create contest
    const { contest, joinCode } = contestDb.createContest(
      name.trim(),
      startTime,
      endTime,
      creatorId
    );

    return NextResponse.json({
      success: true,
      message: 'Contest created successfully',
      contest,
      joinCode,
    });
  } catch (error) {
    console.error('Error creating contest:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
