import { encryptBlob, decryptBlob } from '../src/lib/crypto'
import { randomBytes } from 'crypto'

const TEST_KEY = '0123456789abcdef0123456789abcdef' // 32 bytes
const WRONG_KEY = 'fedcba9876543210fedcba9876543210' // 32 bytes different key

// Override env for test 3
process.env.DOCUMENT_ENCRYPTION_KEY = TEST_KEY

function run() {
  let passed = 0
  let failed = 0

  // Test 1: Small buffer (1KB)
  console.log('Test 1: Encrypt/decrypt 1KB buffer...')
  try {
    const original = randomBytes(1024)
    const encrypted = encryptBlob(original)
    const decrypted = decryptBlob(encrypted)
    if (original.equals(decrypted)) {
      console.log('  ✓ PASS: 1KB round-trip successful\n')
      passed++
    } else {
      console.log('  ✗ FAIL: decrypted data does not match original\n')
      failed++
    }
  } catch (err) {
    console.log(`  ✗ FAIL: unexpected error: ${err}\n`)
    failed++
  }

  // Test 2: Large buffer (16MB)
  console.log('Test 2: Encrypt/decrypt 16MB buffer...')
  try {
    const original = randomBytes(16 * 1024 * 1024)
    const encrypted = encryptBlob(original)
    const decrypted = decryptBlob(encrypted)
    if (original.equals(decrypted)) {
      console.log('  ✓ PASS: 16MB round-trip successful\n')
      passed++
    } else {
      console.log('  ✗ FAIL: decrypted data does not match original\n')
      failed++
    }
  } catch (err) {
    console.log(`  ✗ FAIL: unexpected error: ${err}\n`)
    failed++
  }

  // Test 3: Wrong key throws OperationError
  console.log('Test 3: Decrypt with wrong key throws error...')
  try {
    // Create a separate crypto module with different key
    const wrongKey = WRONG_KEY
    process.env.DOCUMENT_ENCRYPTION_KEY = wrongKey
    // Clear require cache to get fresh module with different key
    delete require.cache[require.resolve('../src/lib/crypto')]
    const cryptoModule = require('../src/lib/crypto')

    const original = randomBytes(256)
    const encrypted = encryptBlob(original)

    // Restore correct key
    process.env.DOCUMENT_ENCRYPTION_KEY = TEST_KEY
    delete require.cache[require.resolve('../src/lib/crypto')]

    // This should fail because we're using wrong key to decrypt
    cryptoModule.decryptBlob(encrypted)
    console.log('  ✗ FAIL: decrypt with wrong key did not throw\n')
    failed++
  } catch (err: any) {
    if (err.message?.includes('authentication') || err.message?.includes('Unsupported')) {
      console.log(`  ✓ PASS: wrong key throws error: ${err.message}\n`)
      passed++
    } else {
      console.log(`  ✗ FAIL: unexpected error type: ${err.message}\n`)
      failed++
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

run()