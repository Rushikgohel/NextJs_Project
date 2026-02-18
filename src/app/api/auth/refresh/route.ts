import { verifyJwt, createAccessTokenForUser, createRefreshTokenForUser } from '@/lib/jwt';
import { NextRequest, NextResponse } from 'next/server';

export type RotateResult = {
  accessToken: string;
  refreshToken: string;
  userId: string;
};

export async function rotateRefreshToken(refreshToken: string): Promise<RotateResult | null> {
  const payload = verifyJwt<{ sub?: string; type?: string }>(refreshToken);
  if (!payload || payload.type !== 'refresh' || !payload.sub) return null;

  const userId = payload.sub;

  // TODO: replace with real DB lookup to ensure the user exists and refresh token is valid / not revoked
  // Example:
  // const user = await findUserById(userId);
  // if (!user) return null;
  const user = { id: userId }; // placeholder

  const accessToken = createAccessTokenForUser({ id: user.id });
  const newRefreshToken = createRefreshTokenForUser(user.id);

  return { accessToken, refreshToken: newRefreshToken, userId: user.id };
}

export async function POST(request: NextRequest) {
  // Try cookie first, fall back to body
  const cookie = request.cookies.get('refreshToken')?.value;
  let incomingToken = cookie;

  if (!incomingToken) {
    try {
      const body = await request.json();
      incomingToken = body?.refreshToken;
    } catch {
      incomingToken = undefined;
    }
  }

  if (!incomingToken) {
    return NextResponse.json({ error: 'Missing refresh token' }, { status: 401 });
  }

  const result = await rotateRefreshToken(incomingToken);
  if (!result) {
    return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
  }

  const res = NextResponse.json({ accessToken: result.accessToken });

  // Set rotated refresh token as HttpOnly cookie
  res.cookies.set('refreshToken', result.refreshToken, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds (match your jwt refresh expiry)
    sameSite: 'lax',
  });

  return res;
}