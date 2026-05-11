import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET,
  adapter: drizzleAdapter(db, {
    provider: 'mysql',
    schema,
    // usePlural: false gives us 'accounts' key (plural) which Better Auth expects
    usePlural: false,
  }),
  // NOTE: experimental.joins: true uses json_array() which MariaDB doesn't support
  // Disabled for MariaDB compatibility
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
})