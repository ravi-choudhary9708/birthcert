import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Application from '@/lib/models/Application';
import { generateApplicationNumber } from '@/lib/application-number';
import { sendSubmissionEmail } from '@/lib/email';
import { getTokenFromRequest } from '@/lib/auth-middleware';

// POST — public, no auth required (parents submit)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const required = [
      'dateOfBirth', 'sex',
      'fatherName', 'fatherMobile', 'fatherEmail', 'fatherReligion', 'fatherEducation', 'fatherOccupation',
      'motherName', 'motherMobile', 'motherEmail', 'motherReligion', 'motherEducation', 'motherOccupation', 'motherAgeAtDelivery',
      'contactEmail',
      'addressAtBirth', 'permanentAddress', 'village', 'subDistrict', 'district', 'state', 'pinCode',
      'placeOfBirth', 'informantName', 'informantMobile', 'deliveryMethod',
    ];

    for (const field of required) {
      if (!body[field] && body[field] !== 0) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    await connectDB();

    const applicationNumber = generateApplicationNumber();

    const application = await Application.create({
      ...body,
      applicationNumber,
      status: 'pending',
    });

    // Send confirmation email (best-effort)
    try {
      await sendSubmissionEmail(body.contactEmail, applicationNumber, body.childName);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr);
    }

    return NextResponse.json({
      success: true,
      applicationNumber,
      id: application._id,
    }, { status: 201 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// GET — staff only, returns list based on role
export async function GET(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    let filter: Record<string, unknown> = {};
    if (user.role === 'verifier') {
      filter = { status: 'pending' };
    } else if (user.role === 'operator') {
      filter = { status: 'verifier_approved' };
    }

    const applications = await Application.find(filter)
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();

    return NextResponse.json({ applications });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
