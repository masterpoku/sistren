/**
 * Test better-auth flow
 * Run: bun run scripts/test-auth.ts
 * Requires: DATABASE_URL, BETTER_AUTH_SECRET env vars
 */

import 'dotenv/config';
import { auth } from '../src/lib/auth';

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'test-password-123';
const TEST_NAME = 'Test User';

async function run() {
  console.log('🔐 Testing better-auth flow...\n');

  // 1. Create user
  console.log('1. Creating user...');
  const user = await auth.api.createUser({
    body: {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      name: TEST_NAME,
    },
  });
  console.log('   ✓ User created:', user.id);

  // 2. Sign in
  console.log('2. Signing in...');
  const signIn = await auth.api.signInEmail({
    body: {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    },
  });
  console.log('   ✓ Sign in response:', JSON.stringify(signIn));

  // 3. Get session
  console.log('3. Getting session...');
  const session = await auth.api.getSession({
    headers: { cookie: `better-auth.session_token=${signIn.sessionToken}` },
  });
  if (!session) {
    console.error('   ✗ FAIL: No session returned');
    process.exit(1);
  }
  console.log('   ✓ Session user:', session.user.name);

  // 4. Sign out
  console.log('4. Signing out...');
  await auth.api.signOut({
    headers: { cookie: `better-auth.session_token=${signIn.sessionToken}` },
  });
  console.log('   ✓ Signed out');

  // 5. Verify session cleared
  console.log('5. Verifying session cleared...');
  const afterSignOut = await auth.api.getSession({
    headers: { cookie: `better-auth.session_token=${signIn.sessionToken}` },
  });
  if (afterSignOut !== null) {
    console.error('   ✗ FAIL: Session still present after sign out');
    process.exit(1);
  }
  console.log('   ✓ Session cleared\n');
  console.log('✅ All tests passed!');
}

run().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
