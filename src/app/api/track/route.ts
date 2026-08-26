import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Application from '@/lib/models/Application';

// Public tracking — GET /api/track?app=BC-2025-XXXXXXXX
export async function GET(req: NextRequest) {
  try {
    const appNumber = req.nextUrl.searchParams.get('app');
    if (!appNumber) return NextResponse.json({ error: 'Application number is required' }, { status: 400 });

    await connectDB();

    const application = await Application.findOne({ applicationNumber: appNumber.toUpperCase() })
      .select('applicationNumber status childName dateOfBirth sex fatherName motherName district state createdAt verifiedAt approvedAt rejectionReason')
      .lean();

    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

    return NextResponse.json({ application });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
