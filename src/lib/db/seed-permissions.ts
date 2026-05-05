import { db } from './index'
import { roles, permissions, rolePermissions } from './schema'

console.log('🌱 Starting permission seed...')

async function seedPermissions() {
  // Get all roles
  const allRoles = await db.select().from(roles)
  console.log('Roles found:', allRoles.map(r => ({ id: r.id, name: r.name, level: r.level })))

  // Get all permissions
  const allPerms = await db.select().from(permissions)
  console.log('Permissions found:', allPerms.length)

  const roleMap = Object.fromEntries(allRoles.map(r => [r.name, r]))
  const permMap = Object.fromEntries(allPerms.map(p => [p.name, p]))

  // Administrator permissions (all except delete/impersonate users, approve grades)
  const adminPermNames = [
    'users.create', 'users.read', 'users.update', // no users.delete, users.impersonate
    'students.create', 'students.read', 'students.update', 'students.delete', 'students.promote', 'students.graduate', 'students.import',
    'teachers.create', 'teachers.read', 'teachers.update', 'teachers.delete', 'teachers.assign_class', 'teachers.assign_subject',
    'classes.manage', 'majors.manage', 'subjects.manage', 'semesters.manage',
    'enrollments.create', 'enrollments.read', 'enrollments.update', 'enrollments.delete',
    'grades.input', 'grades.read_any', 'grades.read_own', 'grades.print', // no grades.approve
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

  // Seed role_permissions for administrator
  for (const permName of adminPermNames) {
    if (roleMap['administrator'] && permMap[permName]) {
      await db.insert(rolePermissions).values({
        roleId: roleMap['administrator'].id,
        permissionId: permMap[permName].id,
      })
    }
  }
  console.log('✅ Seeded administrator permissions')

  // Seed role_permissions for guru
  for (const permName of guruPermNames) {
    if (roleMap['guru'] && permMap[permName]) {
      await db.insert(rolePermissions).values({
        roleId: roleMap['guru'].id,
        permissionId: permMap[permName].id,
      })
    }
  }
  console.log('✅ Seeded guru permissions')

  // Seed role_permissions for siswa
  for (const permName of siswaPermNames) {
    if (roleMap['siswa'] && permMap[permName]) {
      await db.insert(rolePermissions).values({
        roleId: roleMap['siswa'].id,
        permissionId: permMap[permName].id,
      })
    }
  }
  console.log('✅ Seeded siswa permissions')

  // Seed role_permissions for alumni
  for (const permName of alumniPermNames) {
    if (roleMap['alumni'] && permMap[permName]) {
      await db.insert(rolePermissions).values({
        roleId: roleMap['alumni'].id,
        permissionId: permMap[permName].id,
      })
    }
  }
  console.log('✅ Seeded alumni permissions')

  console.log('🎉 Permission seed completed')
}

await seedPermissions()