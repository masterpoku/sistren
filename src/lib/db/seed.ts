import { db } from './index'
import { roles, majors, classes, semesters, subjects, paymentMethods, systemConfigs, users } from './schema'
import { hash } from 'argon2'
import { eq, isNull, and } from 'drizzle-orm'

console.log('🌱 Starting seed...')

async function seed() {

  // ==================== ROLES ====================
  const roleEntries = [
    { name: 'superadmin', description: 'Super Administrator - full access', level: 100, isDefault: false },
    { name: 'administrator', description: 'Administrator - TU/admin staff', level: 80, isDefault: false },
    { name: 'guru', description: 'Teacher - can view classes, input grades', level: 60, isDefault: false },
    { name: 'siswa', description: 'Student - can view own records', level: 40, isDefault: true },
    { name: 'alumni', description: 'Alumni - read-only access to own transcript', level: 20, isDefault: false },
  ]

  for (const entry of roleEntries) {
    const [existing] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(and(eq(roles.name, entry.name), isNull(roles.deletedAt)))
      .limit(1)

    if (existing) {
      console.log(`⏭️  Role '${entry.name}' already exists, skipping`)
    } else {
      // Check if soft-deleted
      const [softDeleted] = await db
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.name, entry.name))
        .limit(1)

      if (softDeleted) {
        await db.update(roles).set({ deletedAt: null }).where(eq(roles.id, softDeleted.id))
        console.log(`♻️  Role '${entry.name}' restored from soft-delete`)
      } else {
        await db.insert(roles).values({ ...entry, deletedAt: null })
        console.log(`✅ Seeded role: ${entry.name}`)
      }
    }
  }

  // ==================== MAJORS ====================
  const majorEntries = [
    { name: 'Teknik Komputer & Jaringan', description: 'TKJ - Computer Networking' },
    { name: 'Rekayasa Perangkat Lunak', description: 'RPL - Software Engineering' },
    { name: 'Teknik Kendaraan Ringan', description: 'Automotive Engineering' },
  ]

  for (const entry of majorEntries) {
    const [existing] = await db
      .select({ id: majors.id })
      .from(majors)
      .where(and(eq(majors.name, entry.name), isNull(majors.deletedAt)))
      .limit(1)

    if (existing) {
      console.log(`⏭️  Major '${entry.name}' already exists, skipping`)
    } else {
      const [softDeleted] = await db
        .select({ id: majors.id })
        .from(majors)
        .where(eq(majors.name, entry.name))
        .limit(1)

      if (softDeleted) {
        await db.update(majors).set({ deletedAt: null }).where(eq(majors.id, softDeleted.id))
        console.log(`♻️  Major '${entry.name}' restored from soft-delete`)
      } else {
        await db.insert(majors).values({ ...entry, deletedAt: null })
        console.log(`✅ Seeded major: ${entry.name}`)
      }
    }
  }

  // ==================== CLASSES ====================
  const classEntries = [
    { name: 'X', code: '10' },
    { name: 'XI', code: '11' },
    { name: 'XII', code: '12' },
  ]

  for (const entry of classEntries) {
    const [existing] = await db
      .select({ id: classes.id })
      .from(classes)
      .where(and(eq(classes.code, entry.code), isNull(classes.deletedAt)))
      .limit(1)

    if (existing) {
      console.log(`⏭️  Class '${entry.name}' already exists, skipping`)
    } else {
      const [softDeleted] = await db
        .select({ id: classes.id })
        .from(classes)
        .where(eq(classes.code, entry.code))
        .limit(1)

      if (softDeleted) {
        await db.update(classes).set({ deletedAt: null }).where(eq(classes.id, softDeleted.id))
        console.log(`♻️  Class '${entry.name}' restored from soft-delete`)
      } else {
        await db.insert(classes).values({ ...entry, deletedAt: null })
        console.log(`✅ Seeded class: ${entry.name}`)
      }
    }
  }

  // ==================== SEMESTERS ====================
  const semesterEntries = [
    { name: 'Semester 1', academicYear: '2025/2026', startDate: new Date('2025-07-15'), endDate: new Date('2025-12-20'), isActive: true },
    { name: 'Semester 2', academicYear: '2025/2026', startDate: new Date('2026-01-10'), endDate: new Date('2026-06-15'), isActive: false },
  ]

  for (const entry of semesterEntries) {
    const [existing] = await db
      .select({ id: semesters.id })
      .from(semesters)
      .where(and(eq(semesters.name, entry.name), eq(semesters.academicYear, entry.academicYear), isNull(semesters.deletedAt)))
      .limit(1)

    if (existing) {
      console.log(`⏭️  Semester '${entry.name}' (${entry.academicYear}) already exists, skipping`)
    } else {
      const [softDeleted] = await db
        .select({ id: semesters.id })
        .from(semesters)
        .where(and(eq(semesters.name, entry.name), eq(semesters.academicYear, entry.academicYear)))
        .limit(1)

      if (softDeleted) {
        await db.update(semesters).set({ deletedAt: null }).where(eq(semesters.id, softDeleted.id))
        console.log(`♻️  Semester '${entry.name}' restored from soft-delete`)
      } else {
        await db.insert(semesters).values({ ...entry, deletedAt: null })
        console.log(`✅ Seeded semester: ${entry.name}`)
      }
    }
  }

  // ==================== SUBJECTS ====================
  const subjectEntries = [
    { name: 'Pemrograman Dasar', code: 'TK101', classId: 1, majorId: 1, credits: 3, description: 'Dasar-dasar pemrograman' },
    { name: 'Matematika Diskrit', code: 'TK102', classId: 1, majorId: 1, credits: 3 },
    { name: 'Struktur Data', code: 'TK103', classId: 1, majorId: 1, credits: 4 },
    { name: 'Basis Data', code: 'TK104', classId: 1, majorId: 1, credits: 3 },
    { name: 'Jaringan Komputer', code: 'TK105', classId: 1, majorId: 1, credits: 3 },
  ]

  for (const entry of subjectEntries) {
    const [existing] = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(and(eq(subjects.code, entry.code!), isNull(subjects.deletedAt)))
      .limit(1)

    if (existing) {
      console.log(`⏭️  Subject '${entry.name}' already exists, skipping`)
    } else {
      const [softDeleted] = await db
        .select({ id: subjects.id })
        .from(subjects)
        .where(eq(subjects.code, entry.code!))
        .limit(1)

      if (softDeleted) {
        await db.update(subjects).set({ deletedAt: null }).where(eq(subjects.id, softDeleted.id))
        console.log(`♻️  Subject '${entry.name}' restored from soft-delete`)
      } else {
        await db.insert(subjects).values({ ...entry, deletedAt: null })
        console.log(`✅ Seeded subject: ${entry.name}`)
      }
    }
  }

  // ==================== PAYMENT METHODS ====================
  const paymentMethodEntries = [
    { name: 'Transfer Bank BCA', provider: 'BCA', accountNumber: '1234567890', accountName: 'SMK TERPADU', instructions: 'Transfer ke BCA 1234567890 a/n SMK TERPADU' },
    { name: 'Transfer Bank Mandiri', provider: 'Mandiri', accountNumber: '0987654321', accountName: 'SMK TERPADU', instructions: 'Transfer ke Mandiri 0987654321 a/n SMK TERPADU' },
    { name: 'Tunai', provider: 'Cash', accountName: 'Keuangan', instructions: 'Bayar langsung ke kasumen' },
    { name: 'GoPay', provider: 'GoPay', accountNumber: '081234567890', accountName: 'SMK TERPADU', instructions: 'Scan QR GoPay ke nomor 081234567890' },
  ]

  for (const entry of paymentMethodEntries) {
    const [existing] = await db
      .select({ id: paymentMethods.id })
      .from(paymentMethods)
      .where(eq(paymentMethods.name, entry.name))
      .limit(1)

    if (existing) {
      console.log(`⏭️  Payment method '${entry.name}' already exists, skipping`)
    } else {
      await db.insert(paymentMethods).values(entry)
      console.log(`✅ Seeded payment method: ${entry.name}`)
    }
  }

  // ==================== SYSTEM CONFIGS ====================
  const systemConfigEntries = [
    { key: 'school_name', value: 'SMK TERPADU', description: 'School name in header' },
    { key: 'school_address', value: 'Jl. Pendidikan No. 123', description: 'Full address' },
    { key: 'school_phone', value: '021-1234567', description: 'Contact number' },
    { key: 'academic_year', value: '2025/2026', description: 'Current academic year' },
  ]

  for (const entry of systemConfigEntries) {
    const [existing] = await db
      .select({ id: systemConfigs.id })
      .from(systemConfigs)
      .where(eq(systemConfigs.key, entry.key))
      .limit(1)

    if (existing) {
      console.log(`⏭️  System config '${entry.key}' already exists, skipping`)
    } else {
      await db.insert(systemConfigs).values(entry)
      console.log(`✅ Seeded system config: ${entry.key}`)
    }
  }

  // ==================== ADMIN USERS ====================
  const adminUsers = [
    { name: 'Super Admin', email: 'superadmin@sistren.com', roleId: 1 },
    { name: 'Administrator', email: 'admin@sistren.com', roleId: 2 },
  ]

  const superadminPassword = await hash('Password123!')
  const adminPassword = await hash('Password123!')

  for (let i = 0; i < adminUsers.length; i++) {
    const entry = adminUsers[i]
    const pw = i === 0 ? superadminPassword : adminPassword

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, entry.email), isNull(users.deletedAt)))
      .limit(1)

    if (existing) {
      console.log(`⏭️  User '${entry.email}' already exists, skipping`)
    } else {
      const [softDeleted] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, entry.email))
        .limit(1)

      if (softDeleted) {
        await db.update(users).set({ deletedAt: null }).where(eq(users.id, softDeleted.id))
        console.log(`♻️  User '${entry.email}' restored from soft-delete`)
      } else {
        await db.insert(users).values({
          name: entry.name,
          email: entry.email,
          password: pw,
          confirmed: true,
          roleId: entry.roleId,
          deletedAt: null,
        })
        console.log(`✅ Seeded user: ${entry.email}`)
      }
    }
  }

  console.log('🎉 All seed data processed successfully')
}

await seed()
await db.end()
process.exit(0)