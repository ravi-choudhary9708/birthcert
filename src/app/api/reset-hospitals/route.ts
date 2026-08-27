import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Hospital from '@/lib/models/Hospital';
import User from '@/lib/models/User';
import Application from '@/lib/models/Application';
import mongoose from 'mongoose';

// GET /api/reset-hospitals — drops hospitals and resets (dev only)
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Reset is disabled in production' }, { status: 403 });
  }

  try {
    await connectDB();
    
    const results: string[] = [];

    // Drop hospitals collection
    try {
      await mongoose.connection.db.collection('hospitals').drop();
      results.push('Dropped hospitals collection');
    } catch (err) {
      results.push('Hospitals collection did not exist or already dropped');
    }

    // Drop users collection
    try {
      await mongoose.connection.db.collection('users').drop();
      results.push('Dropped users collection');
    } catch (err) {
      results.push('Users collection did not exist or already dropped');
    }

    // Remove hospitalId from applications
    try {
      const updateResult = await mongoose.connection.db.collection('applications').updateMany(
        {},
        { $unset: { hospitalId: '', hospitalNo: '' } }
      );
      results.push(`Updated ${updateResult.modifiedCount} applications`);
    } catch (err) {
      results.push('No applications to update or applications collection does not exist');
    }

    return NextResponse.json({
      message: 'Reset complete. Run /api/seed to create 39 Madhubani hospitals',
      success: true,
      details: results
    });

  } catch (err) {
    console.error('Reset error:', err);
    return NextResponse.json({ 
      error: 'Server error', 
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}
