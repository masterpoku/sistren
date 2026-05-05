import { db } from '../src/lib/db/index'
import { users, accounts } from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hash } from 'argon2'

async function seedBetterAuthUsers() {
  console.log('🔍 Creating users with Better Auth compatible password storage...')

  const superadminEmail = 'superadmin@sister.com'
  const adminEmail = 'admin@sister.com'

  // Check if superadmin exists in users
  const existingSuperadmin = await db.select().from(users).where(eq(users.email, superadminEmail)).limit(1)

  let superadminUserId: number

  if (existingSuperadmin.length === 0) {
    // Create user
    const hashedPassword = await hash('Password123!')
    const result = await db.insert(users).values({
      name: 'Super Admin',
      email: superadminEmail,
      password: hashedPassword,
      confirmed: true,
      roleId: 1,
    })

    // Get the last inserted ID
    const inserted = await db.select().from(users).where(eq(users.email, superadminEmail)).limit(1)
    superadminUserId = inserted[0].id
    console.log('✅ Created superadmin user with ID:', superadminUserId)

    // Create account for better-auth (stores password hash)
    await db.insert(accounts).values({
      userId: superadminUserId,
      type: 'credentials',
      provider: 'email',
      providerAccountId: superadminEmail,
    })
    console.log('✅ Created better-auth account for superadmin')
  } else {
    superadminUserId = existingSuperadmin[0].id
    console.log('ℹ️  Superadmin already exists with ID:', superadminUserId)
  }

  // Check if admin exists
  const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1)

  if (existingAdmin.length === 0) {
    const hashedPassword = await hash('Password123!')
    await db.insert(users).values({
      name: 'Administrator',
      email: adminEmail,
      password: hashedPassword,
      confirmed: true,
      roleId: 2,
    })

    const inserted = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1)
    const adminUserId = inserted[0].id
    console.log('✅ Created admin user with ID:', adminUserId)

    await db.insert(accounts).values({
      userId: adminUserId,
      type: 'credentials',
      provider: 'email',
      providerAccountId: adminEmail,
    })
    console.log('✅ Created better-auth account for admin')
  } else {
    console.log('ℹ️  Admin already exists')
  }

  console.log('🎉 User seeding complete!')
}

seedBetterAuthUsers()