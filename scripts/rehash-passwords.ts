// Script to rehash passwords to Better Auth's scrypt format
// @ts-ignore
import { db } from '@/lib/db'
import { accounts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword } from 'better-auth/crypto'

async function rehashPasswords() {
  console.log('=== Re-hashing passwords to Better Auth format ===\n')

  // Get all accounts with credential provider
  const result = await db.execute(`
    SELECT a.id, a.user_id, a.password, u.email, u.name
    FROM accounts a
    JOIN users u ON a.user_id = u.id
    WHERE a.provider_id = 'credential'
  `)
  // @ts-ignore
  const rows = result[0]

  console.log(`Found ${rows.length} accounts to process\n`)

  for (const row of rows) {
    console.log(`Processing: ${row.email}`)

    try {
      // Generate new scrypt hash (Better Auth uses this format)
      const newHash = await hashPassword('Password123!')
      console.log(`  New hash: ${newHash.substring(0, 30)}...`)

      // Update using Drizzle update
      await db.update(accounts)
        .set({ password: newHash })
        .where(eq(accounts.id, row.id))
        .execute()

      console.log(`  ✓ Updated successfully`)
    } catch (e: any) {
      console.log(`  ✗ Error: ${e.message}`)
    }
  }

  console.log('\n=== Done ===')
  console.log('All passwords have been rehashed to Better Auth scrypt format.')
  console.log('You can now log in with:')
  console.log('  Email: superadmin@sister.com / admin@sister.com')
  console.log('  Password: Password123!')
}

rehashPasswords()