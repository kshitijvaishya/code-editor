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

    const { contestId, terminated } = await request.json();

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

    // If this is a termination request, update the existing entry
    if (terminated) {
      if (existingEntry) {
        await contestEntries.updateOne(
          { contestId, userId: user.userId },
          { 
            $set: { 
              terminated: true,
              terminatedAt: new Date().toISOString()
            } 
          }
        );
      } else {
        // Create entry with termination flag if it doesn't exist
        await contestEntries.insertOne({
          contestId,
          userId: user.userId,
          username: user.username,
          startedAt: new Date().toISOString(),
          terminated: true,
          terminatedAt: new Date().toISOString(),
        });
      }
      return NextResponse.json({
        success: true,
        message: 'Contest termination recorded',
      });
    }

    if (existingEntry) {
      // If already started and terminated, prevent re-entry
      if (existingEntry.terminated) {
        return NextResponse.json(
          { success: false, message: 'This contest was terminated. You cannot re-enter.', terminated: true },
          { status: 403 }
        );
      }
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
      terminated: false,
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
      terminated: entry?.terminated || false,
    });
  } catch (error) {
    console.error('Error checking contest entry:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
