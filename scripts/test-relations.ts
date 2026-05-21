/**
 * Test Drizzle relations across the schema.
 * Run with: bun run scripts/test-relations.ts
 *
 * MySQL note: Drizzle's .returning() is not supported for MySQL (no native RETURNING).
 * Instead we insert, get insertId, then query back the full record with relations.
 */

import { drizzle } from 'drizzle-orm/mysql2'
import { eq, isNull } from 'drizzle-orm'
import * as schema from '../src/lib/db/schema'
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT) ?? 3306,
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? 'root',
  database: process.env.DB_NAME ?? 'sistren',
  waitForConnections: true,
  connectionLimit: 10,
})

const db = drizzle(pool, { schema, mode: 'default' })

async function cleanup() {
  // Delete in dependency order (children first)
  await db.delete(schema.enrollments)
  await db.delete(schema.profiles)
  await db.delete(schema.userPermissions)
  await db.delete(schema.rolePermissions)
  await db.delete(schema.permissions)
  await db.delete(schema.roles)
  await db.delete(schema.users)
}

// Test 1: User + Profile (one-to-one via userId)
async function testUserProfile() {
  console.log('\n--- Test 1: User + Profile (one-to-one) ---')

  const email = `siswa-${Date.now()}@test.local`

  // Insert user (MySQL: no returning(), use insertId)
  const userResult = await db.insert(schema.users).values({
    name: 'Test Siswa',
    email,
    password: 'hashedpassword123',
    emailVerified: true,
  }).execute()

  const userId = Number(userResult.insertId)
  console.log('Created user insertId:', userId)

  // Insert profile linked to user
  const profileResult = await db.insert(schema.profiles).values({
    userId,
    type: 'siswa',
    nik: '1234567890123456',
    nisn: '0012345678',
    birthPlace: 'Jakarta',
    birthDate: '2005-03-15',
    gender: 'male',
    address: 'Jl. Test No. 1',
    phone: '081234567890',
    religion: 'Islam',
  }).execute()

  const profileId = Number(profileResult.insertId)
  console.log('Created profile insertId:', profileId)

  // Fetch user with relations
  const userWithProfile = await db.query.users.findFirst({
    where: (u, { and, eq, isNull }) => and(
      eq(u.id, userId),
      isNull(u.deletedAt)
    ),
    with: {
      accounts: true,
      role: true,
    },
  })

  // Fetch profile with relations
  const profileWithUser = await db.query.profiles.findFirst({
    where: (p, { and, eq, isNull }) => and(
      eq(p.id, profileId),
      isNull(p.deletedAt)
    ),
    with: {
      user: true,
      major: true,
    },
  })

  console.log('User accounts count:', userWithProfile?.accounts?.length ?? 0)
  console.log('User role:', userWithProfile?.role ? `id=${userWithProfile.role.id}` : 'null')
  console.log('Profile user name:', profileWithUser?.user?.name)
  console.log('Profile type:', profileWithUser?.type)

  const pass = !!userWithProfile && !!profileWithUser
  console.log('Result:', pass ? 'PASS ✅' : 'FAIL ❌')
  return pass
}

// Test 2: User with roles + permissions (many-to-many via pivot)
async function testRolesPermissions() {
  console.log('\n--- Test 2: User with roles + permissions (many-to-many) ---')

  // Create role
  const roleResult = await db.insert(schema.roles).values({
    name: `test-role-${Date.now()}`,
    description: 'Test role',
    level: 50,
  }).execute()
  const roleId = Number(roleResult.insertId)
  console.log('Created role:', roleId)

  // Create permissions
  const perm1Result = await db.insert(schema.permissions).values({
    name: 'test.read',
    description: 'Test read',
    resource: 'test',
    action: 'read',
  }).execute()
  const perm2Result = await db.insert(schema.permissions).values({
    name: 'test.write',
    description: 'Test write',
    resource: 'test',
    action: 'write',
  }).execute()
  const perm1Id = Number(perm1Result.insertId)
  const perm2Id = Number(perm2Result.insertId)
  console.log('Created permissions:', perm1Id, perm2Id)

  // Link role to permissions via pivot
  await db.insert(schema.rolePermissions).values([
    { roleId, permissionId: perm1Id },
    { roleId, permissionId: perm2Id },
  ]).execute()
  console.log('Linked role → permissions pivot')

  // Create user with this role
  const userResult = await db.insert(schema.users).values({
    name: 'Test User Role',
    email: `roleuser-${Date.now()}@test.local`,
    password: 'hashedpassword123',
    roleId,
    emailVerified: true,
  }).execute()
  const userId = Number(userResult.insertId)
  console.log('Created user with roleId:', userId)

  // Fetch user with role
  const userWithRole = await db.query.users.findFirst({
    where: (u, { and, eq, isNull }) => and(
      eq(u.id, userId),
      isNull(u.deletedAt)
    ),
    with: {
      role: true,
    },
  })

  // Fetch role permissions via pivot
  const rolePerms = await db.query.rolePermissions.findMany({
    where: eq(schema.rolePermissions.roleId, roleId),
  })
  console.log('Role-permission links count:', rolePerms.length)

  const pass = !!userWithRole?.role && rolePerms.length === 2
  console.log('Result:', pass ? 'PASS ✅' : 'FAIL ❌')
  return pass
}

// Test 3: Enrollment chain (student + class + semester)
async function testEnrollmentChain() {
  console.log('\n--- Test 3: Enrollment chain (FK chain) ---')

  // Create semester
  const semResult = await db.insert(schema.semesters).values({
    name: 'Ganjil',
    academicYear: '2024/2025',
    isActive: true,
    startDate: '2024-07-01',
    endDate: '2024-12-31',
  }).execute()
  const semesterId = Number(semResult.insertId)
  console.log('Created semester:', semesterId)

  // Create class
  const classResult = await db.insert(schema.classes).values({
    name: 'X IPA 1',
    code: `X-IPA-1-${Date.now()}`,
  }).execute()
  const classId = Number(classResult.insertId)
  console.log('Created class:', classId)

  // Create student user
  const studentResult = await db.insert(schema.users).values({
    name: 'Test Enrollment Student',
    email: `enroll-${Date.now()}@test.local`,
    password: 'hashedpassword123',
    emailVerified: true,
  }).execute()
  const studentId = Number(studentResult.insertId)
  console.log('Created student user:', studentId)

  // Create profile for student
  const profileResult = await db.insert(schema.profiles).values({
    userId: studentId,
    type: 'siswa',
    birthPlace: 'Bandung',
    birthDate: '2005-08-20',
    gender: 'female',
    address: 'Jl. Enrollment No. 1',
    religion: 'Islam',
  }).execute()
  console.log('Created student profile:', profileResult.insertId)

  // Create enrollment linking student + class + semester
  const enrollmentResult = await db.insert(schema.enrollments).values({
    studentId,
    semesterId,
    classId,
  }).execute()
  const enrollmentId = Number(enrollmentResult.insertId)
  console.log('Created enrollment:', enrollmentId)

  // Fetch enrollment with all relations
  const enrollmentWithChain = await db.query.enrollments.findFirst({
    where: (e, { and, eq, isNull }) => and(
      eq(e.id, enrollmentId),
      isNull(e.deletedAt)
    ),
    with: {
      student: true,
      semester: true,
      class: true,
    },
  })

  console.log('Enrollment student:', enrollmentWithChain?.student?.name)
  console.log('Enrollment semester:', enrollmentWithChain?.semester?.name)
  console.log('Enrollment class:', enrollmentWithChain?.class?.name)

  const pass = !!enrollmentWithChain?.student && !!enrollmentWithChain?.semester && !!enrollmentWithChain?.class
  console.log('Result:', pass ? 'PASS ✅' : 'FAIL ❌')
  return pass
}

async function main() {
  console.log('Starting relation tests...')

  try {
    const r1 = await testUserProfile()
    const r2 = await testRolesPermissions()
    const r3 = await testEnrollmentChain()

    const allPassed = r1 && r2 && r3
    console.log('\n========================================')
    console.log('FINAL:', allPassed ? 'ALL PASS ✅' : 'SOME FAILURES ❌')
    console.log('========================================\n')
  } catch (err) {
    console.error('Test error:', err)
    console.log('\n========================================')
    console.log('FINAL: ERROR ❌')
    console.log('========================================\n')
  } finally {
    await cleanup()
    await pool.end()
    process.exit(0)
  }
}

main()