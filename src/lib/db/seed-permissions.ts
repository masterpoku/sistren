import { db } from './index'
import { roles, permissions, rolePermissions } from './schema'
import { isNull } from 'drizzle-orm'

console.log('🌱 Starting permission seed...')

async function seedPermissions() {
  // Get all roles (active only)
  const allRoles = await db.select().from(roles).where(isNull(roles.deletedAt))
  console.log('Roles found:', allRoles.map(r => ({ id: r.id, name: r.name, level: r.level })))

  // Get all permissions (active only)
  const allPerms = await db.select().from(permissions).where(isNull(permissions.deletedAt))
  console.log('Permissions found:', allPerms.length)

  if (allRoles.length === 0 || allPerms.length === 0) {
    console.log('⚠️  No roles or permissions found. Run base seed first.')
    return
  }

  const roleMap = Object.fromEntries(allRoles.map(r => [r.name, r]))
  const permMap = Object.fromEntries(allPerms.map(p => [p.name, p]))

  // Administrator permissions
  const adminPermNames = [
    'users.create', 'users.read', 'users.update',
    'students.create', 'students.read', 'students.update', 'students.delete', 'students.promote', 'students.graduate', 'students.import',
    'teachers.create', 'teachers.read', 'teachers.update', 'teachers.delete', 'teachers.assign_class', 'teachers.assign_subject',
    'classes.manage', 'majors.manage', 'subjects.manage', 'semesters.manage',
    'enrollments.create', 'enrollments.read', 'enrollments.update', 'enrollments.delete',
    'grades.input', 'grades.read_any', 'grades.read_own', 'grades.print',
    'announcements.create', 'announcements.read', 'announcements.update', 'announcements.delete', 'announcements.publish',
    'payments.create', 'payments.read_any', 'payments.read_own', 'payments.update', 'payments.approve', 'payments.generate_report',
    'payment_methods.manage', 'system_configs.manage',
    'profile.edit_own', 'profile.edit_any', 'profile.assets.upload',
  ]

  // Guru permissions
  const guruPermNames = [
    'grades.input', 'grades.read_any', 'students.read', 'announcements.read',
    'profile.edit_own', 'subjects.manage', 'teachers.read', 'classes.manage',
    'majors.manage', 'semesters.manage', 'enrollments.read',
  ]

  // Siswa permissions
  const siswaPermNames = [
    'grades.read_own', 'announcements.read', 'profile.edit_own', 'students.read',
    'payments.read_own', 'enrollments.read',
  ]

  // Alumni permissions
  const alumniPermNames = [
    'grades.read_own', 'profile.edit_own',
  ]

  const assignments = [
    { roleName: 'superadmin', perms: allPerms.map(p => p.name) },
    { roleName: 'administrator', perms: adminPermNames },
    { roleName: 'guru', perms: guruPermNames },
    { roleName: 'siswa', perms: siswaPermNames },
    { roleName: 'alumni', perms: alumniPermNames },
  ]

  for (const { roleName, perms } of assignments) {
    if (!roleMap[roleName]) {
      console.log(`⏭️  Role '${roleName}' not found, skipping`)
      continue
    }

    for (const permName of perms) {
      if (!permMap[permName]) {
        console.log(`⏭️  Permission '${permName}' not found, skipping`)
        continue
      }

      try {
        await db.insert(rolePermissions).values({
          roleId: roleMap[roleName].id,
          permissionId: permMap[permName].id,
        })
      } catch (e: any) {
        if (e.code === 'ER_DUP_ENTRY') {
          // Already assigned, skip silently
        } else {
          throw e
        }
      }
    }
    console.log(`✅ Seeded ${roleName} permissions`)
  }

  console.log('🎉 Permission seed completed')
}

await seedPermissions()