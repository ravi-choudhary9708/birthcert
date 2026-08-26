import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/lib/auth-middleware';

export async function GET(req: NextRequest) {
  const user = getTokenFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ id: user.id, email: user.email, role: user.role, name: user.name });
}
