import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-characters-long-for-security'
);

export interface UserSession {
  userId: string;
  username: string;
  email: string;
}

interface JWTUserPayload extends JWTPayload {
  userId: string;
  username: string;
  email: string;
}

// Create JWT token
export async function createToken(user: UserSession): Promise<string> {
  const payload: JWTUserPayload = {
    userId: user.userId,
    username: user.username,
    email: user.email,
  };
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  return token;
}

// Verify JWT token
export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const verified = await jwtVerify<JWTUserPayload>(token, JWT_SECRET);
    const payload = verified.payload;
    
    if (!payload.userId || !payload.username || !payload.email) {
      return null;
    }
    
    return {
      userId: payload.userId,
      username: payload.username,
      email: payload.email,
    };
  } catch (error) {
    return null;
  }
}

// Get current user from request
export async function getCurrentUser(request: NextRequest): Promise<UserSession | null> {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

// Set auth cookie
export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

// Clear auth cookie
export function clearAuthCookie(response: NextResponse) {
  response.cookies.delete('auth-token');
}

// Get current user from cookies (server component)
export async function getServerUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  return verifyToken(token);
}
