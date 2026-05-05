import { auth } from '../src/lib/auth/index'

async function createUser() {
  console.log('🔍 Creating user via Better Auth API...')

  try {
    // Use Better Auth's internal sign-up mechanism
    const result = await auth.api.signUp.email({
      body: {
        email: 'superadmin@sister.com',
        password: 'Password123!',
        name: 'Super Admin',
      },
    })

    console.log('Sign up result:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.error('Sign up error:', error)
  }

  // Try to sign in
  console.log('\n🔐 Testing login...')
  try {
    const signInResult = await auth.api.signIn.email({
      body: {
        email: 'superadmin@sister.com',
        password: 'Password123!',
      },
    })
    console.log('Sign in result:', JSON.stringify(signInResult, null, 2))
  } catch (error) {
    console.error('Sign in error:', error)
  }
}

createUser()