import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import Hospital from '@/lib/models/Hospital';

// GET /api/seed — creates default hospitals and staff accounts (dev only)
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seed is disabled in production' }, { status: 403 });
  }

  await connectDB();

  const created: string[] = [];

  // Create 39 hospitals (Madhubani District, Bihar)
  const hospitalData = [
    { hospitalNo: 1, name: 'SADAR HOSPITAL MADHUBANI', district: 'Madhubani' },
    { hospitalNo: 2, name: 'PRIMARY HEALTH CENTRE PANDAUL', district: 'Madhubani' },
    { hospitalNo: 3, name: 'SUB DIVISIONAL HOSPITAL, JAYNAGAR', district: 'Madhubani' },
    { hospitalNo: 4, name: 'SUPRITENDENT SUB DIVISIONAL HOSPITAL JHANJHARPUR', district: 'Madhubani' },
    { hospitalNo: 5, name: 'PRIMARY HEALTH CENTRE MADHEPUR', district: 'Madhubani' },
    { hospitalNo: 6, name: 'SUPRITENDENT SUB DIVISIONAL HOSPITAL PHULPARAS', district: 'Madhubani' },
    { hospitalNo: 7, name: 'REFERRAL HOSPITAL ANDHRATHARI', district: 'Madhubani' },
    { hospitalNo: 8, name: 'PHC GHOGHARDIHA', district: 'Madhubani' },
    { hospitalNo: 9, name: 'PHC BENIPATTI MADHUBANI', district: 'Madhubani' },
    { hospitalNo: 10, name: 'PRIMARY HEALTH CENTRE MADHWAPUR', district: 'Madhubani' },
    { hospitalNo: 11, name: 'CHC MADHWAPUR', district: 'Madhubani' },
    { hospitalNo: 12, name: 'PRIMARY HEALTH CENTRE JHANJHARPUR', district: 'Madhubani' },
    { hospitalNo: 13, name: 'PRIMARY HEALTH CENTRE RAJNAGAR', district: 'Madhubani' },
    { hospitalNo: 14, name: 'CHC RAJNAGAR', district: 'Madhubani' },
    { hospitalNo: 15, name: 'PHC LAUKAHI MADHUBANI', district: 'Madhubani' },
    { hospitalNo: 16, name: 'CHC LAUKAHI', district: 'Madhubani' },
    { hospitalNo: 17, name: 'PHC KHUTAUNA', district: 'Madhubani' },
    { hospitalNo: 18, name: 'CHC KHUTAUNA', district: 'Madhubani' },
    { hospitalNo: 19, name: 'PHC BABUBARHI', district: 'Madhubani' },
    { hospitalNo: 20, name: 'CHC BABUBARHI', district: 'Madhubani' },
    { hospitalNo: 21, name: 'PRIMARY HEALTH CENTER RAHIKA', district: 'Madhubani' },
    { hospitalNo: 22, name: 'CHC RAHIKA', district: 'Madhubani' },
    { hospitalNo: 23, name: 'PHC ANDHRATHADHI', district: 'Madhubani' },
    { hospitalNo: 24, name: 'PRIMARY HEALTH CENTRE LAKHNAUR', district: 'Madhubani' },
    { hospitalNo: 25, name: 'CHC LAKHNAUR', district: 'Madhubani' },
    { hospitalNo: 26, name: 'PHC KALUAHI', district: 'Madhubani' },
    { hospitalNo: 27, name: 'CHC KALUAHI', district: 'Madhubani' },
    { hospitalNo: 28, name: 'PRIMARY HEALTH CENTRE KHAJAULI', district: 'Madhubani' },
    { hospitalNo: 29, name: 'CHC KHAJAULI', district: 'Madhubani' },
    { hospitalNo: 30, name: 'PRIMARI HEALTH CENTRE BISFI', district: 'Madhubani' },
    { hospitalNo: 31, name: 'CHC BISFI', district: 'Madhubani' },
    { hospitalNo: 32, name: 'PRIMARY HEALTH CENTRE BASOPATTI', district: 'Madhubani' },
    { hospitalNo: 33, name: 'PHC HARLAKHI', district: 'Madhubani' },
    { hospitalNo: 34, name: 'CHC HARLAKHI', district: 'Madhubani' },
    { hospitalNo: 35, name: 'PRIMARY HEALTH CENTRE JAYNAGAR', district: 'Madhubani' },
    { hospitalNo: 36, name: 'PRIMARY HEALTH CENTRE PHULPARAS', district: 'Madhubani' },
    { hospitalNo: 37, name: 'PRIMARY HEALTH CENTRE LADANIA', district: 'Madhubani' },
    { hospitalNo: 38, name: 'CHC LADANIA', district: 'Madhubani' },
    { hospitalNo: 39, name: 'APHC MAHRAIL', district: 'Madhubani' },
  ];

  for (const hospitalInfo of hospitalData) {
    const exists = await Hospital.findOne({ hospitalNo: hospitalInfo.hospitalNo });
    if (!exists) {
      await Hospital.create({
        ...hospitalInfo,
        contactNo: `+91-11-${1000 + hospitalInfo.hospitalNo}${Math.floor(Math.random() * 9000) + 1000}`,
      });
      created.push(`Hospital ${hospitalInfo.hospitalNo}: ${hospitalInfo.name}`);
    }
  }

  // Create staff accounts for all 39 hospitals
  const allHospitals = await Hospital.find({}).sort({ hospitalNo: 1 });
  
  const accounts = [];
  
  // Create one staff member for each hospital
  for (const hospital of allHospitals) {
    accounts.push({
      name: `${hospital.name} Staff`,
      email: `hospital${hospital.hospitalNo}@madhubani.gov`,
      password: 'Hospital@123',
      role: 'hospital_staff' as const,
      hospitalId: hospital._id
    });
  }
  
  // Add operator account
  accounts.push({
    name: 'District Operator', 
    email: 'operator@madhubani.gov', 
    password: 'Operator@123', 
    role: 'operator' as const
  });
  
  // Add admin account
  accounts.push({
    name: 'System Administrator', 
    email: 'admin@madhubani.gov', 
    password: 'Admin@System@2025', 
    role: 'admin' as const
  });

  for (const acc of accounts) {
    const exists = await User.findOne({ email: acc.email });
    if (!exists) {
      const passwordHash = await bcrypt.hash(acc.password, 10);
      await User.create({ 
        name: acc.name, 
        email: acc.email, 
        passwordHash, 
        role: acc.role,
        ...('hospitalId' in acc ? { hospitalId: acc.hospitalId } : {})
      });
      created.push(`User: ${acc.email}`);
    }
  }

  return NextResponse.json({
    message: 'Seed complete',
    created,
    hospitals: created.filter(item => item.startsWith('Hospital')).length,
    accounts: accounts.map(a => ({ 
      email: a.email, 
      password: a.password, 
      role: a.role,
      hospitalId: a.hospitalId 
    })),
  });
}
