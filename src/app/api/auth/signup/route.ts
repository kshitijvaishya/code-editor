import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/userDb';
import { createToken, setAuthCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    // Validation
    if (!username || !username.trim()) {
      return NextResponse.json(
        { success: false, message: 'Username is required' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const emailExists = await userDb.emailExists(email);
    if (emailExists) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await userDb.createUser(username.trim(), email.trim(), hashedPassword);

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    // Set auth cookie
    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });

    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error('Error in signup:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
