'use server'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, profiles } from '@/lib/db/schema'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'

export async function registerAction(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Basic validation
  if (!name || !email || !password || !confirmPassword) {
    return { error: 'Semua field wajib diisi.' }
  }

  if (password.length < 6) {
    return { error: 'Password minimal 6 karakter.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Password dan konfirmasi password tidak cocok.' }
  }

  // Check if email already exists
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existing) {
    return { error: 'Email sudah terdaftar.' }
  }

  try {
    // Create user via better-auth
    const result = await auth.api.signUpEmail({
      body: { email, password, name },
      headers: await headers(),
    })

    const userId = ('id' in result ? result.id : result.user.id) as string

    // Create default profile for siswa type
    await db.insert(profiles).values({
      userId,
      type: 'siswa',
    })

    redirect('/login')
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      err.message.includes('NEXT_REDIRECT')
    ) {
      throw err
    }
    return { error: 'Terjadi kesalahan. Silakan coba lagi.' }
  }
}