import { db } from './index'
import { roles, majors, classes, semesters, subjects, paymentMethods, systemConfigs, users } from './schema'
import { hash } from 'argon2'

console.log('🌱 Starting seed...')

async function seed() {
  // Seed roles with level and is_default
  await db.insert(roles).values([
    { name: 'superadmin', description: 'Super Administrator - full access', level: 100, isDefault: false },
    { name: 'administrator', description: 'Administrator - TU/admin staff', level: 80, isDefault: false },
    { name: 'guru', description: 'Teacher - can view classes, input grades', level: 60, isDefault: false },
    { name: 'siswa', description: 'Student - can view own records', level: 40, isDefault: true },
    { name: 'alumni', description: 'Alumni - read-only access to own transcript', level: 20, isDefault: false },
  ])
  console.log('✅ Seeded roles')

  // Seed majors
  await db.insert(majors).values([
    { name: 'Teknik Komputer & Jaringan', description: 'TKJ - Computer Networking' },
    { name: 'Rekayasa Perangkat Lunak', description: 'RPL - Software Engineering' },
    { name: 'Teknik Kendaraan Ringan', description: 'Automotive Engineering' },
  ])
  console.log('✅ Seeded majors')

  // Seed classes (grade levels)
  await db.insert(classes).values([
    { name: 'X', code: '10' },
    { name: 'XI', code: '11' },
    { name: 'XII', code: '12' },
  ])
  console.log('✅ Seeded classes')

  // Seed semesters (current academic year)
  await db.insert(semesters).values([
    { name: 'Semester 1', academicYear: '2025/2026', startDate: new Date('2025-07-15'), endDate: new Date('2025-12-20'), isActive: true },
    { name: 'Semester 2', academicYear: '2025/2026', startDate: new Date('2026-01-10'), endDate: new Date('2026-06-15'), isActive: false },
  ])
  console.log('✅ Seeded semesters')

  // Seed sample subjects for TKJ (major_id = 1) class X (class_id = 1)
  await db.insert(subjects).values([
    { name: 'Pemrograman Dasar', code: 'TK101', classId: 1, majorId: 1, credits: 3, description: 'Dasar-dasar pemrograman' },
    { name: 'Matematika Diskrit', code: 'TK102', classId: 1, majorId: 1, credits: 3 },
    { name: 'Struktur Data', code: 'TK103', classId: 1, majorId: 1, credits: 4 },
    { name: 'Basis Data', code: 'TK104', classId: 1, majorId: 1, credits: 3 },
    { name: 'Jaringan Komputer', code: 'TK105', classId: 1, majorId: 1, credits: 3 },
  ])
  console.log('✅ Seeded subjects')

  // Seed payment methods
  await db.insert(paymentMethods).values([
    { name: 'Transfer Bank BCA', provider: 'BCA', accountNumber: '1234567890', accountName: 'SMK TERPADU', instructions: 'Transfer ke BCA 1234567890 a/n SMK TERPADU' },
    { name: 'Transfer Bank Mandiri', provider: 'Mandiri', accountNumber: '0987654321', accountName: 'SMK TERPADU', instructions: 'Transfer ke Mandiri 0987654321 a/n SMK TERPADU' },
    { name: 'Tunai', provider: 'Cash', accountName: 'Keuangan', instructions: 'Bayar langsung ke kasumen' },
    { name: 'GoPay', provider: 'GoPay', accountNumber: '081234567890', accountName: 'SMK TERPADU', instructions: 'Scan QR GoPay ke nomor 081234567890' },
  ])
  console.log('✅ Seeded payment methods')

  // Seed system configs
  await db.insert(systemConfigs).values([
    { key: 'school_name', value: 'SMK TERPADU', description: 'School name in header' },
    { key: 'school_address', value: 'Jl. Pendidikan No. 123', description: 'Full address' },
    { key: 'school_phone', value: '021-1234567', description: 'Contact number' },
    { key: 'academic_year', value: '2025/2026', description: 'Current academic year' },
  ])
  console.log('✅ Seeded system configs')

  // Seed admin users (same credentials as old PHP)
  const superadminPassword = await hash('Password123!')
  const adminPassword = await hash('Password123!')

  await db.insert(users).values([
    {
      name: 'Super Admin',
      email: 'superadmin@sister.com',
      password: superadminPassword,
      confirmed: true,
      roleId: 1, // superadmin
    },
    {
      name: 'Administrator',
      email: 'admin@sister.com',
      password: adminPassword,
      confirmed: true,
      roleId: 2, // administrator
    },
  ])
  console.log('✅ Seeded admin users')

  console.log('🎉 All seed data inserted successfully')
}

await seed()
