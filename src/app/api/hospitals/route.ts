import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Hospital from '@/lib/models/Hospital';

// GET /api/hospitals — public endpoint for application form
export async function GET() {
  try {
    await connectDB();

    const hospitals = await Hospital.find({})
      .select('hospitalNo name district')
      .sort({ hospitalNo: 1 })
      .lean();

    return NextResponse.json({ hospitals });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}