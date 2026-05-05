import { db } from '../src/lib/db/index'
import { users } from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hash } from 'argon2'

async function checkAndSeedUsers() {
  console.log('🔍 Checking if users exist...')

  const existingUsers = await db.select().from(users).limit(10)
  console.log('Existing users:', existingUsers.length)

  if (existingUsers.length === 0) {
    console.log('⚠️  No users found. Please run full seed: bun run db:seed')
    return
  }

  // Check for superadmin
  const superadmin = await db.select().from(users).where(eq(users.email, 'superadmin@sister.com')).limit(1)
  console.log('Superadmin found:', superadmin.length > 0)

  if (superadmin.length === 0) {
    console.log('➕ Creating superadmin user...')
    const hashedPassword = await hash('Password123!')
    await db.insert(users).values({
      name: 'Super Admin',
      email: 'superadmin@sister.com',
      password: hashedPassword,
      confirmed: true,
      roleId: 1,
    })
    console.log('✅ Superadmin created')
  } else {
    console.log('ℹ️  Superadmin already exists')
  }

  // Check for admin
  const admin = await db.select().from(users).where(eq(users.email, 'admin@sister.com')).limit(1)
  if (admin.length === 0) {
    console.log('➕ Creating admin user...')
    const hashedPassword = await hash('Password123!')
    await db.insert(users).values({
      name: 'Administrator',
      email: 'admin@sister.com',
      password: hashedPassword,
      confirmed: true,
      roleId: 2,
    })
    console.log('✅ Admin created')
  } else {
    console.log('ℹ️  Admin already exists')
  }

  console.log('🎉 User check complete!')
}

checkAndSeedUsers()