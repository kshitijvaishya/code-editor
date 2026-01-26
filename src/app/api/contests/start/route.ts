import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { contestId } = await request.json();

    if (!contestId) {
      return NextResponse.json(
        { success: false, message: 'Contest ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const contestEntries = db.collection('contest_entries');

    // Check if user has already started this contest
    const existingEntry = await contestEntries.findOne({
      contestId,
      userId: user.userId,
    });

    if (existingEntry) {
      return NextResponse.json(
        { success: false, message: 'You have already started this contest', alreadyStarted: true },
        { status: 400 }
      );
    }

    // Record that user has started the contest
    await contestEntries.insertOne({
      contestId,
      userId: user.userId,
      username: user.username,
      startedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Contest entry recorded',
    });
  } catch (error) {
    console.error('Error recording contest start:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const contestId = searchParams.get('contestId');

    if (!contestId) {
      return NextResponse.json(
        { success: false, message: 'Contest ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const contestEntries = db.collection('contest_entries');

    // Check if user has started this contest
    const entry = await contestEntries.findOne({
      contestId,
      userId: user.userId,
    });

    return NextResponse.json({
      success: true,
      hasStarted: !!entry,
      startedAt: entry?.startedAt,
    });
  } catch (error) {
    console.error('Error checking contest entry:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
