import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { userDb } from '@/lib/userDb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch full user data from database including codeRuns
    const fullUserData = await userDb.getUserById(user.userId);

    if (!fullUserData) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        userId: fullUserData.id,
        username: fullUserData.username,
        email: fullUserData.email,
        createdAt: fullUserData.createdAt,
        codeRuns: fullUserData.codeRuns,
      },
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
