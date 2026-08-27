import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Application from '@/lib/models/Application';
import Hospital from '@/lib/models/Hospital';
import { getTokenFromRequest } from '@/lib/auth-middleware';

// GET /api/admin/analytics — admin only
export async function GET(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    // Applications by status
    const statusCounts = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Applications by hospital
    const hospitalCounts = await Application.aggregate([
      {
        $lookup: {
          from: 'hospitals',
          localField: 'hospitalId',
          foreignField: '_id',
          as: 'hospital'
        }
      },
      {
        $unwind: '$hospital'
      },
      {
        $group: {
          _id: {
            hospitalId: '$hospitalId',
            hospitalNo: '$hospital.hospitalNo',
            hospitalName: '$hospital.name'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.hospitalNo': 1 }
      }
    ]);

    // Average verification turnaround (verifiedAt - createdAt)
    const turnaroundStats = await Application.aggregate([
      {
        $match: { verifiedAt: { $exists: true } }
      },
      {
        $project: {
          turnaroundHours: {
            $divide: [
              { $subtract: ['$verifiedAt', '$createdAt'] },
              1000 * 60 * 60 // Convert ms to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageTurnaroundHours: { $avg: '$turnaroundHours' },
          minTurnaroundHours: { $min: '$turnaroundHours' },
          maxTurnaroundHours: { $max: '$turnaroundHours' }
        }
      }
    ]);

    // Rejection reason breakdown
    const rejectionReasons = await Application.aggregate([
      {
        $match: { 
          status: 'rejected',
          rejectionReason: { $exists: true, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$rejectionReason',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Certificates issued per month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyIssuance = await Application.aggregate([
      {
        $match: {
          status: 'operator_approved',
          approvedAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$approvedAt' },
            month: { $month: '$approvedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Total counts
    const totalApplications = await Application.countDocuments();
    const totalHospitals = await Hospital.countDocuments();

    return NextResponse.json({
      totalApplications,
      totalHospitals,
      statusCounts,
      hospitalCounts,
      turnaroundStats: turnaroundStats[0] || { averageTurnaroundHours: 0, minTurnaroundHours: 0, maxTurnaroundHours: 0 },
      rejectionReasons,
      monthlyIssuance
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}