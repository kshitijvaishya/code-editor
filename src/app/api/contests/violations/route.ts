import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Record a violation
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { contestId, type, details } = await request.json();

    if (!contestId || !type) {
      return NextResponse.json(
        { success: false, message: 'Contest ID and violation type are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const violationsCollection = db.collection('contest_violations');

    // Record the violation
    await violationsCollection.insertOne({
      contestId,
      userId: user.userId,
      username: user.username,
      type, // 'paste', 'copy', 'cut', 'right-click', 'keyboard-shortcut'
      details: details || '',
      timestamp: new Date().toISOString(),
    });

    // Count total violations for this user in this contest
    const totalViolations = await violationsCollection.countDocuments({
      contestId,
      userId: user.userId,
    });

    // Update the contest_entries record with violation count
    const contestEntries = db.collection('contest_entries');
    await contestEntries.updateOne(
      { contestId, userId: user.userId },
      {
        $set: {
          violationCount: totalViolations,
          lastViolationAt: new Date().toISOString(),
          lastViolationType: type,
        },
        $push: {
          violations: {
            type,
            details: details || '',
            timestamp: new Date().toISOString(),
          }
        } as any
      }
    );

    return NextResponse.json({
      success: true,
      totalViolations,
      message: totalViolations >= 3
        ? 'Contest terminated due to repeated violations'
        : `Warning ${totalViolations}/3: ${type} detected`,
    });
  } catch (error) {
    console.error('Error recording violation:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get violations for a contest (for moderation)
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
    const userId = searchParams.get('userId');

    if (!contestId) {
      return NextResponse.json(
        { success: false, message: 'Contest ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const violationsCollection = db.collection('contest_violations');

    const query: any = { contestId };
    if (userId) {
      query.userId = userId;
    }

    const violations = await violationsCollection
      .find(query)
      .sort({ timestamp: -1 })
      .toArray();

    // Get violation summary per user
    const contestEntries = db.collection('contest_entries');
    const entries = await contestEntries
      .find({ contestId })
      .toArray();

    const summary = entries
      .filter(e => (e.violationCount || 0) > 0)
      .map(e => ({
        userId: e.userId,
        username: e.username,
        violationCount: e.violationCount || 0,
        lastViolationAt: e.lastViolationAt,
        lastViolationType: e.lastViolationType,
        terminated: e.terminated || false,
        violations: e.violations || [],
      }));

    return NextResponse.json({
      success: true,
      violations,
      summary,
    });
  } catch (error) {
    console.error('Error fetching violations:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
