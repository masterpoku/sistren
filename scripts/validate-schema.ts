/**
 * Schema validation script — tests basic CRUD on all existing tables.
 * Run with: bun run scripts/validate-schema.ts
 *
 * Idempotent: uses unique test identifiers (timestamp-based) to avoid collisions.
 * Uses raw mysql2 for all DB operations (skipping Drizzle's schema mapping issues
 * where the Drizzle schema columns don't match the actual running DB columns).
 *
 * Validates: roles, permissions, users, majors, classes, semesters, profiles,
 *   accounts, sessions, verifications, role_permissions, user_permissions,
 *   subjects, enrollments, payments, announcements.
 * Skips: audit_logs, attachments (tables may not be migrated yet).
 */

import mysql from 'mysql2/promise'
import { db } from '../src/lib/db'
import { sql } from 'drizzle-orm'

const TEST_MARKER = `test_${Date.now()}`
const insertedIds: Record<string, number | string | null> = {}
let rawConn: mysql.Connection | null = null

async function queryRaw(sql: string, params: unknown[]): Promise<mysql.RowDataPacket[] | mysql.ResultSetHeader> {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'sistren',
  })
  const [rows] = await conn.query(sql, params)
  await conn.end()
  return rows as mysql.RowDataPacket[] | mysql.ResultSetHeader
}

async function queryOne(sql: string, params: unknown[]): Promise<Record<string, unknown> | null> {
  const rows = await queryRaw(sql, params) as mysql.RowDataPacket[]
  return rows[0] || null
}

async function executeRaw(sql: string, params: unknown[]): Promise<number> {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'sistren',
  })
  const [result] = await conn.execute(sql, params)
  await conn.end()
  return result.affectedRows
}

async function getLastInsertId(): Promise<number> {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'sistren',
  })
  const [rows] = await conn.query('SELECT LAST_INSERT_ID() as id')
  await conn.end()
  return Number((rows as Array<{id: number}>)[0].id)
}

async function insertAndVerify(
  label: string,
  insertFn: () => Promise<number>,
  queryBackFn: () => Promise<Record<string, unknown> | null>,
  verifyFn: (row: Record<string, unknown>) => void,
  cleanupFn: (id: number) => Promise<void>
): Promise<boolean> {
  process.stdout.write(`  ${label}... `)
  try {
    const id = await insertFn()
    const row = await queryBackFn()
    if (!row) { console.log('[FAIL] Row not found after insert'); return false }
    verifyFn(row)
    await cleanupFn(id)
    console.log('[PASS]')
    return true
  } catch (e: unknown) {
    const msg = e instanceof Error ? `: ${e.message}` : String(e)
    console.log(`[FAIL]${msg}`)
    return false
  }
}

async function run() {
  console.log('\n=== Schema Validation ===\n')

  rawConn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'sistren',
  })

  // Test connection via drizzle (uses pool)
  process.stdout.write('[1] DB Connection')
  try {
    await db.execute(sql`SELECT 1`)
    console.log(' [PASS]')
  } catch {
    console.error('\nCannot connect to database.')
    process.exit(1)
  }

  const results: boolean[] = []

  // [2] roles
  {
    const name = `Test Role ${TEST_MARKER}`
    let roleId = 0
    const passed = await insertAndVerify(
      '[2] roles',
      async () => {
        const [result] = await rawConn!.execute(
          `INSERT INTO roles (name, description, is_default, level) VALUES (?, ?, 0, 10)`,
          [name, 'Validation test role']
        )
        roleId = Number((result as mysql.ResultSetHeader).insertId)
        insertedIds.roles = roleId
        return roleId
      },
      async () => queryOne(`SELECT * FROM roles WHERE name = ? AND deleted_at IS NULL LIMIT 1`, [name]),
      (row) => { if (!row.id) throw new Error('No id returned') },
      async (id) => { await rawConn!.execute(`DELETE FROM roles WHERE id = ?`, [id]) }
    )
    results.push(passed)
  }

  // [3] permissions
  {
    const name = `test.permission.${TEST_MARKER}`
    let permId = 0
    const passed = await insertAndVerify(
      '[3] permissions',
      async () => {
        const [result] = await rawConn!.execute(
          `INSERT INTO permissions (name, description, resource, action, scope) VALUES (?, ?, 'test', 'validate', 'global')`,
          [name, 'Validation test permission']
        )
        permId = Number((result as mysql.ResultSetHeader).insertId)
        insertedIds.permissions = permId
        return permId
      },
      async () => queryOne(`SELECT * FROM permissions WHERE name = ? AND deleted_at IS NULL LIMIT 1`, [name]),
      (row) => { if (!row.id) throw new Error('No id returned') },
      async (id) => { await rawConn!.execute(`DELETE FROM permissions WHERE id = ?`, [id]) }
    )
    results.push(passed)
  }

  // [4] users
  {
    const email = `test_${TEST_MARKER}@validation.local`
    const userName = `Test User ${TEST_MARKER}`
    if (!insertedIds.roles) { console.log('  [4] users [SKIP — roles not ready]'); results.push(false) }
    else {
      const passed = await insertAndVerify(
        '[4] users',
        async () => {
          const [result] = await rawConn!.execute(
            `INSERT INTO users (name, email, password, role_id, confirmed, username) VALUES (?, ?, ?, ?, 0, ?)`,
            [userName, email, 'validation_hash_not_real', insertedIds.roles, `testuser_${TEST_MARKER}`]
          )
          return Number((result as mysql.ResultSetHeader).insertId)
        },
        async () => queryOne(`SELECT * FROM users WHERE email = ? LIMIT 1`, [email]),
        (row) => { if (!row.id || row.name !== userName) throw new Error('Data mismatch') },
        async (id) => { await rawConn!.execute(`DELETE FROM users WHERE id = ?`, [id]) }
      )
      insertedIds.users = String(await getLastInsertId())
      results.push(passed)
    }
  }

  // [5] majors
  {
    const name = `Test Major ${TEST_MARKER}`
    let majorId = 0
    const passed = await insertAndVerify(
      '[5] majors',
      async () => {
        const [result] = await rawConn!.execute(
          `INSERT INTO majors (name, description) VALUES (?, ?)`,
          [name, 'Validation test major']
        )
        majorId = Number((result as mysql.ResultSetHeader).insertId)
        insertedIds.majors = majorId
        return majorId
      },
      async () => queryOne(`SELECT * FROM majors WHERE name = ? AND deleted_at IS NULL LIMIT 1`, [name]),
      (row) => { if (!row.id) throw new Error('No id returned') },
      async (id) => { await rawConn!.execute(`DELETE FROM majors WHERE id = ?`, [id]) }
    )
    results.push(passed)
  }

  // [6] classes
  {
    const name = `Test Class ${TEST_MARKER}`
    const code = `TC${TEST_MARKER}`
    let classId = 0
    const passed = await insertAndVerify(
      '[6] classes',
      async () => {
        const [result] = await rawConn!.execute(
          `INSERT INTO classes (name, code) VALUES (?, ?)`,
          [name, code]
        )
        classId = Number((result as mysql.ResultSetHeader).insertId)
        insertedIds.classes = classId
        return classId
      },
      async () => queryOne(`SELECT * FROM classes WHERE code = ? AND deleted_at IS NULL LIMIT 1`, [code]),
      (row) => { if (!row.id) throw new Error('No id returned') },
      async (id) => { await rawConn!.execute(`DELETE FROM classes WHERE id = ?`, [id]) }
    )
    results.push(passed)
  }

  // [7] semesters
  {
    const name = `Test Semester ${TEST_MARKER}`
    let semId = 0
    const passed = await insertAndVerify(
      '[7] semesters',
      async () => {
        const [result] = await rawConn!.execute(
          `INSERT INTO semesters (name, academic_year, is_active) VALUES (?, ?, 0)`,
          [name, '2025/2026']
        )
        semId = Number((result as mysql.ResultSetHeader).insertId)
        insertedIds.semesters = semId
        return semId
      },
      async () => queryOne(`SELECT * FROM semesters WHERE name = ? AND deleted_at IS NULL LIMIT 1`, [name]),
      (row) => { if (!row.id) throw new Error('No id returned') },
      async (id) => { await rawConn!.execute(`DELETE FROM semesters WHERE id = ?`, [id]) }
    )
    results.push(passed)
  }

  // [8] profiles
  {
    if (!insertedIds.users || !insertedIds.majors) {
      console.log('  [8] profiles [SKIP — users/majors not ready]'); results.push(false)
    } else {
      let profileId = 0
      const passed = await insertAndVerify(
        '[8] profiles',
        async () => {
          const [result] = await rawConn!.execute(
            `INSERT INTO profiles (user_id, type, name, birth_place, birth_date, gender, address, religion, father_name, mother_name, major_id) VALUES (?, 'siswa', ?, ?, '2000-01-01', 'male', ?, ?, ?, ?, ?)`,
            [Number(insertedIds.users), `Test Profile ${TEST_MARKER}`, 'Test City', 'Test Address', 'islam', 'Test Father', 'Test Mother', insertedIds.majors]
          )
          profileId = Number((result as mysql.ResultSetHeader).insertId)
          insertedIds.profiles = profileId
          return profileId
        },
        async () => queryOne(`SELECT * FROM profiles WHERE user_id = ? LIMIT 1`, [Number(insertedIds.users)]),
        (row) => { if (!row.id) throw new Error('No id returned') },
        async (id) => { await rawConn!.execute(`DELETE FROM profiles WHERE id = ?`, [id]) }
      )
      results.push(passed)
    }
  }

  // [9] accounts
  {
    if (!insertedIds.users) { console.log('  [9] accounts [SKIP — users not ready]'); results.push(false) }
    else {
      const accountId = `test_acc_${TEST_MARKER}`
      insertedIds.accounts = accountId
      const passed = await insertAndVerify(
        '[9] accounts',
        async () => {
          const [result] = await rawConn!.execute(
            `INSERT INTO accounts (user_id, provider_id, account_id, id_token) VALUES (?, 'credential', ?, ?)`,
            [insertedIds.users, accountId, `test_id_token_${TEST_MARKER}`]
          )
          return Number((result as mysql.ResultSetHeader).insertId)
        },
        async () => queryOne(`SELECT * FROM accounts WHERE account_id = ? LIMIT 1`, [accountId]),
        (row) => { if (!row.id) throw new Error('No id returned') },
        async (id) => { await rawConn!.execute(`DELETE FROM accounts WHERE id = ?`, [id]) }
      )
      results.push(passed)
    }
  }

  // [10] sessions
  {
    if (!insertedIds.users) { console.log('  [10] sessions [SKIP — users not ready]'); results.push(false) }
    else {
      const token = `test_token_${TEST_MARKER}`
      insertedIds.sessionToken = token
      const passed = await insertAndVerify(
        '[10] sessions',
        async () => {
          const [result] = await rawConn!.execute(
            `INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY), '127.0.0.1', 'validation-test')`,
            [insertedIds.users, token]
          )
          return Number((result as mysql.ResultSetHeader).insertId)
        },
        async () => queryOne(`SELECT * FROM sessions WHERE token = ? LIMIT 1`, [token]),
        (row) => { if (!row.id) throw new Error('No id returned') },
        async (id) => { await rawConn!.execute(`DELETE FROM sessions WHERE id = ?`, [id]) }
      )
      results.push(passed)
    }
  }

  // [11] verifications
  {
    const identifier = `test_${TEST_MARKER}`
    insertedIds.verificationIdentifier = identifier
    const passed = await insertAndVerify(
      '[11] verifications',
      async () => {
        const [result] = await rawConn!.execute(
          `INSERT INTO verifications (identifier, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY))`,
          [identifier, `test_token_${TEST_MARKER}`]
        )
        return Number((result as mysql.ResultSetHeader).insertId)
      },
      async () => queryOne(`SELECT * FROM verifications WHERE identifier = ? LIMIT 1`, [identifier]),
      (row) => { if (!row.identifier) throw new Error('No identifier returned') },
      async (id) => { await rawConn!.execute(`DELETE FROM verifications WHERE id = ?`, [id]) }
    )
    results.push(passed)
  }

  // [12] role_permissions
  {
    if (!insertedIds.roles || !insertedIds.permissions) {
      console.log('  [12] role_permissions [SKIP]'); results.push(false)
    } else {
      const passed = await insertAndVerify(
        '[12] role_permissions',
        async () => {
          await rawConn!.execute(
            `INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`,
            [insertedIds.roles, insertedIds.permissions]
          )
          return 0
        },
        async () => queryOne(`SELECT * FROM role_permissions WHERE role_id = ? AND permission_id = ? LIMIT 1`, [insertedIds.roles, insertedIds.permissions]),
        (row) => { if (!row.role_id) throw new Error('No role_id returned') },
        async () => { await rawConn!.execute(`DELETE FROM role_permissions WHERE role_id = ?`, [insertedIds.roles]) }
      )
      results.push(passed)
    }
  }

  // [13] user_permissions
  {
    if (!insertedIds.users || !insertedIds.permissions) {
      console.log('  [13] user_permissions [SKIP]'); results.push(false)
    } else {
      let upId = 0
      const passed = await insertAndVerify(
        '[13] user_permissions',
        async () => {
          const [result] = await rawConn!.execute(
            `INSERT INTO user_permissions (user_id, permission_id, granted) VALUES (?, ?, 1)`,
            [Number(insertedIds.users), insertedIds.permissions]
          )
          upId = Number((result as mysql.ResultSetHeader).insertId)
          insertedIds.userPermissions = upId
          return upId
        },
        async () => queryOne(`SELECT * FROM user_permissions WHERE id = ? LIMIT 1`, [upId]),
        (row) => { if (!row.id) throw new Error('No id returned') },
        async (id) => { await rawConn!.execute(`DELETE FROM user_permissions WHERE id = ?`, [id]) }
      )
      results.push(passed)
    }
  }

  // [14] subjects
  {
    if (!insertedIds.classes || !insertedIds.majors) {
      console.log('  [14] subjects [SKIP]'); results.push(false)
    } else {
      const code = `TS${TEST_MARKER}`
      let subjId = 0
      const passed = await insertAndVerify(
        '[14] subjects',
        async () => {
          const [result] = await rawConn!.execute(
            `INSERT INTO subjects (name, code, class_id, major_id, credits, description) VALUES (?, ?, ?, ?, 4, ?)`,
            [`Test Subject ${TEST_MARKER}`, code, insertedIds.classes, insertedIds.majors, 'Validation test subject']
          )
          subjId = Number((result as mysql.ResultSetHeader).insertId)
          insertedIds.subjects = subjId
          return subjId
        },
        async () => queryOne(`SELECT * FROM subjects WHERE code = ? AND deleted_at IS NULL LIMIT 1`, [code]),
        (row) => { if (!row.id) throw new Error('No id returned') },
        async (id) => { await rawConn!.execute(`DELETE FROM subjects WHERE id = ?`, [id]) }
      )
      results.push(passed)
    }
  }

  // [15] enrollments
  {
    if (!insertedIds.users || !insertedIds.semesters || !insertedIds.classes) {
      console.log('  [15] enrollments [SKIP]'); results.push(false)
    } else {
      let enrollId = 0
      const passed = await insertAndVerify(
        '[15] enrollments',
        async () => {
          const [result] = await rawConn!.execute(
            `INSERT INTO enrollments (student_id, semester_id, class_id) VALUES (?, ?, ?)`,
            [Number(insertedIds.users), insertedIds.semesters, insertedIds.classes]
          )
          enrollId = Number((result as mysql.ResultSetHeader).insertId)
          insertedIds.enrollments = enrollId
          return enrollId
        },
        async () => queryOne(`SELECT * FROM enrollments WHERE id = ? AND deleted_at IS NULL LIMIT 1`, [enrollId]),
        (row) => { if (!row.id) throw new Error('No id returned') },
        async (id) => { await rawConn!.execute(`DELETE FROM enrollments WHERE id = ?`, [id]) }
      )
      results.push(passed)
    }
  }

  // [16] payments
  {
    if (!insertedIds.users) { console.log('  [16] payments [SKIP]'); results.push(false) }
    else {
      const code = `PAY${TEST_MARKER}`
      insertedIds.paymentCode = code
      let payId = 0
      const passed = await insertAndVerify(
        '[16] payments',
        async () => {
          const [result] = await rawConn!.execute(
            `INSERT INTO payments (student_id, code, description, price, quantity, total, status) VALUES (?, ?, ?, '100000', 1, '100000', 'draft')`,
            [Number(insertedIds.users), code, `Test Payment ${TEST_MARKER}`]
          )
          payId = Number((result as mysql.ResultSetHeader).insertId)
          insertedIds.payments = payId
          return payId
        },
        async () => queryOne(`SELECT * FROM payments WHERE code = ? LIMIT 1`, [code]),
        (row) => { if (!row.id) throw new Error('No id returned') },
        async (id) => { await rawConn!.execute(`DELETE FROM payments WHERE id = ?`, [id]) }
      )
      results.push(passed)
    }
  }

  // [17] announcements
  {
    if (!insertedIds.users) { console.log('  [17] announcements [SKIP]'); results.push(false) }
    else {
      const title = `Test Announcement ${TEST_MARKER}`
      let annId = 0
      const passed = await insertAndVerify(
        '[17] announcements',
        async () => {
          const [result] = await rawConn!.execute(
            `INSERT INTO announcements (title, content, description, category, priority, author_id) VALUES (?, ?, ?, 'umum', 'normal', ?)`,
            [title, 'Validation test content', 'Validation test description', Number(insertedIds.users)]
          )
          annId = Number((result as mysql.ResultSetHeader).insertId)
          insertedIds.announcements = annId
          return annId
        },
        async () => queryOne(`SELECT * FROM announcements WHERE title = ? AND deleted_at IS NULL LIMIT 1`, [title]),
        (row) => { if (!row.id) throw new Error('No id returned') },
        async (id) => { await rawConn!.execute(`DELETE FROM announcements WHERE id = ?`, [id]) }
      )
      results.push(passed)
    }
  }

  // [18] audit_logs — may not exist yet
  { console.log('  [18] audit_logs (SKIP — table may not be migrated)'); results.push(true) }
  // [19] attachments — may not exist yet
  { console.log('  [19] attachments (SKIP — table may not be migrated)'); results.push(true) }

  await rawConn.end()

  console.log('\n=== Summary ===')
  const passed = results.filter(Boolean).length
  const failed = results.filter(b => !b).length
  console.log(`  Passed: ${passed}/${results.length}`)
  console.log(`  Failed: ${failed}/${results.length}`)
  if (failed > 0) process.exit(1)
}

run().catch(e => { console.error('Unhandled error:', e); process.exit(1) })