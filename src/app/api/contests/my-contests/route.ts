import { NextRequest, NextResponse } from 'next/server';
import { contestDb } from '@/lib/contestDb';

export async function GET(request: NextRequest) {
  try {
    // Mock user ID (in production, get from auth session)
    const userId = 'user123';

    // Get all contests for the user
    const contests = contestDb.getUserContests(userId);

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
