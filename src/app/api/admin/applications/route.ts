import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Application from '@/lib/models/Application';
import { getTokenFromRequest } from '@/lib/auth-middleware';

// GET /api/admin/applications — admin only, unscoped view of all applications
export async function GET(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const hospitalId = searchParams.get('hospitalId');
    const applicationNumber = searchParams.get('applicationNumber');

    let filter: Record<string, unknown> = {};

    if (status) filter.status = status;
    if (hospitalId) filter.hospitalId = hospitalId;
    if (applicationNumber) {
      filter.applicationNumber = { $regex: applicationNumber, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const applications = await Application.find(filter)
      .populate('hospitalId', 'name hospitalNo district')
      .populate('verifiedBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean();

    const total = await Application.countDocuments(filter);

    return NextResponse.json({ 
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}