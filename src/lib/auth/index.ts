import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { admin } from 'better-auth/plugins/admin'
import { nextCookies } from 'better-auth/next-js'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'mysql',
    schema,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,    // 1 day
  },
  additionalFields: {
    roleId: {
      type: 'number',
      required: false,
      input: false, // admin-only, not user-settable during signup
    },
  },
  plugins: [
    admin(),
    nextCookies(), // MUST be last
  ],
})