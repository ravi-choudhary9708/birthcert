import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Application from '@/lib/models/Application';
import {
  sendVerifierApprovedEmail,
  sendApprovedEmail,
  sendRejectedEmail,
} from '@/lib/email';
import { getTokenFromRequest } from '@/lib/auth-middleware';

// GET — view single application (staff or public with appNumber query)
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await connectDB();

    const application = await Application.findById(id).select('-__v').lean();
    if (!application) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ application });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH — verifier approves/rejects, operator gives final approval
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await context.params;
    const { action, rejectionReason } = await req.json();

    await connectDB();
    const application = await Application.findById(id);
    if (!application) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Verifier actions
    if (user.role === 'verifier') {
      if (application.status !== 'pending')
        return NextResponse.json({ error: 'Application is not pending' }, { status: 400 });

      if (action === 'approve') {
        application.status = 'verifier_approved';
        application.verifiedBy = user.id as unknown as typeof application.verifiedBy;
        application.verifiedAt = new Date();
        await application.save();
        try { await sendVerifierApprovedEmail(application.contactEmail, application.applicationNumber); } catch {}
        return NextResponse.json({ success: true, status: 'verifier_approved' });

      } else if (action === 'reject') {
        if (!rejectionReason)
          return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
        application.status = 'rejected';
        application.rejectionReason = rejectionReason;
        application.verifiedBy = user.id as unknown as typeof application.verifiedBy;
        application.verifiedAt = new Date();
        await application.save();
        try { await sendRejectedEmail(application.contactEmail, application.applicationNumber, rejectionReason); } catch {}
        return NextResponse.json({ success: true, status: 'rejected' });
      }
    }

    // Operator actions
    if (user.role === 'operator') {
      if (application.status !== 'verifier_approved')
        return NextResponse.json({ error: 'Application is not in verifier_approved state' }, { status: 400 });

      if (action === 'approve') {
        application.status = 'operator_approved';
        application.approvedBy = user.id as unknown as typeof application.approvedBy;
        application.approvedAt = new Date();
        await application.save();
        try { await sendApprovedEmail(application.contactEmail, application.applicationNumber, application.childName); } catch {}
        return NextResponse.json({ success: true, status: 'operator_approved' });

      } else if (action === 'reject') {
        if (!rejectionReason)
          return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
        application.status = 'rejected';
        application.rejectionReason = rejectionReason;
        application.approvedBy = user.id as unknown as typeof application.approvedBy;
        application.approvedAt = new Date();
        await application.save();
        try { await sendRejectedEmail(application.contactEmail, application.applicationNumber, rejectionReason); } catch {}
        return NextResponse.json({ success: true, status: 'rejected' });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
