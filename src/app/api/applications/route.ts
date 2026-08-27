import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Application from '@/lib/models/Application';
import Hospital from '@/lib/models/Hospital';
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
      'hospitalId', // NEW: Required hospital selection
    ];

    for (const field of required) {
      if (!body[field] && body[field] !== 0) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    await connectDB();

    // Verify hospital exists and get hospital number
    const hospital = await Hospital.findById(body.hospitalId);
    if (!hospital) {
      return NextResponse.json({ error: 'Invalid hospital selected' }, { status: 400 });
    }

    const applicationNumber = generateApplicationNumber();

    const application = await Application.create({
      ...body,
      applicationNumber,
      hospitalNo: hospital.hospitalNo,
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

// GET — staff only, returns list based on role with row-level security
export async function GET(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    let filter: Record<string, unknown> = {};
    
    if (user.role === 'hospital_staff') {
      // Hospital staff only see their own hospital's applications
      if (!user.hospitalId) {
        return NextResponse.json({ error: 'Hospital staff must be assigned to a hospital' }, { status: 400 });
      }
      filter = { 
        status: 'pending',
        hospitalId: user.hospitalId 
      };
    } else if (user.role === 'operator') {
      // Operators see all verifier_approved applications across all hospitals
      filter = { status: 'verifier_approved' };
    } else if (user.role === 'admin') {
      // Admin sees everything - no filter applied
      filter = {};
    } else {
      return NextResponse.json({ error: 'Invalid role' }, { status: 403 });
    }

    const applications = await Application.find(filter)
      .populate('hospitalId', 'name hospitalNo district')
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();

    return NextResponse.json({ applications });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
