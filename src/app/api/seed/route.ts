import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

// GET /api/seed — creates default staff accounts (dev only)
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seed is disabled in production' }, { status: 403 });
  }

  await connectDB();

  const accounts = [
    { name: 'Verifier Staff', email: 'verifier@example.com', password: 'Verifier@123', role: 'verifier' as const },
    { name: 'Operator Staff', email: 'operator@example.com', password: 'Operator@123', role: 'operator' as const },
  ];

  const created: string[] = [];
  for (const acc of accounts) {
    const exists = await User.findOne({ email: acc.email });
    if (!exists) {
      const passwordHash = await bcrypt.hash(acc.password, 10);
      await User.create({ name: acc.name, email: acc.email, passwordHash, role: acc.role });
      created.push(acc.email);
    }
  }

  return NextResponse.json({
    message: 'Seed complete',
    created,
    accounts: accounts.map(a => ({ email: a.email, password: a.password, role: a.role })),
  });
}
