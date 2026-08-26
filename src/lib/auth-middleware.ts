import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';

export function getTokenFromRequest(req: NextRequest): JWTPayload | null {
  const cookie = req.cookies.get('token')?.value;
  if (!cookie) return null;
  return verifyToken(cookie);
}

export function requireAuth(
  req: NextRequest,
  allowedRoles: Array<'verifier' | 'operator'>
): { user: JWTPayload } | NextResponse {
  const user = getTokenFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return { user };
}

export function isAuthError(val: unknown): val is NextResponse {
  return val instanceof NextResponse;
}
