import { createAuthClient } from 'better-auth/client'
import { adminClient } from 'better-auth/client/plugins'

const authBaseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  plugins: [adminClient()],
})

// Convenience exports
export const { signIn, signUp, signOut, useSession } = authClient
export const { admin } = authClient
export type Session = NonNullable<Awaited<ReturnType<typeof authClient['getSession']>>['data']>