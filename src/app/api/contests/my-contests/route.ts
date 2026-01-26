import { NextRequest, NextResponse } from 'next/server';
import { contestDb } from '@/lib/contestDb';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get all contests for the user
    const contests = await contestDb.getUserContests(user.userId);

    return NextResponse.json({
      success: true,
      contests,
    });
  } catch (error) {
    console.error('Error fetching contests:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
