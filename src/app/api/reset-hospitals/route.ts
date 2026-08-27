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

    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'Database connection not initialized' }, { status: 500 });
    }

    // Drop hospitals collection
    try {
      await db.collection('hospitals').drop();
      results.push('Dropped hospitals collection');
    } catch {
      results.push('Hospitals collection did not exist or already dropped');
    }

    // Drop users collection
    try {
      await db.collection('users').drop();
      results.push('Dropped users collection');
    } catch {
      results.push('Users collection did not exist or already dropped');
    }

    // Remove hospitalId from applications
    try {
      const updateResult = await db.collection('applications').updateMany(
        {},
        { $unset: { hospitalId: '', hospitalNo: '' } }
      );
      results.push(`Updated ${updateResult.modifiedCount} applications`);
    } catch {
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
