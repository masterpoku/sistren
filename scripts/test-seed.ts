import { db } from '../src/lib/db/index';
import { seed } from '../src/lib/db/seed';

interface Row {
  [key: string]: unknown;
}

async function count(table: string): Promise<number> {
  const [data] = (await db.execute(`SELECT COUNT(*) as cnt FROM ${table}`)) as [
    Row[],
    unknown,
  ];
  return Number(data[0]['cnt'] ?? 0);
}

async function main() {
  console.log('=== Test Seed Idempotency ===\n');

  // Count before
  const rolesBefore = await count('roles');
  const permsBefore = await count('permissions');
  const rolePermsBefore = await count('role_permissions');
  console.log(
    `Before seed — roles: ${rolesBefore}, permissions: ${permsBefore}, role_permissions: ${rolePermsBefore}`
  );

  // Run seed
  console.log('\nRunning seed...');
  await seed();
  console.log('Seed complete.\n');

  // Count after first run
  const rolesAfter1 = await count('roles');
  const permsAfter1 = await count('permissions');
  const rolePermsAfter1 = await count('role_permissions');
  console.log(
    `After 1st seed — roles: ${rolesAfter1}, permissions: ${permsAfter1}, role_permissions: ${rolePermsAfter1}`
  );

  // Run seed again
  console.log('\nRunning seed again...');
  await seed();
  console.log('Seed complete.\n');

  // Count after second run
  const rolesAfter2 = await count('roles');
  const permsAfter2 = await count('permissions');
  const rolePermsAfter2 = await count('role_permissions');
  console.log(
    `After 2nd seed — roles: ${rolesAfter2}, permissions: ${permsAfter2}, role_permissions: ${rolePermsAfter2}`
  );

  // Assertions
  let pass = true;

  // Idempotency checks
  if (rolesAfter1 !== rolesAfter2) {
    console.error(
      `FAIL: roles count changed after 2nd seed (${rolesAfter1} → ${rolesAfter2})`
    );
    pass = false;
  } else {
    console.log(`PASS: roles idempotent (${rolesAfter1})`);
  }

  if (permsAfter1 !== permsAfter2) {
    console.error(
      `FAIL: permissions count changed after 2nd seed (${permsAfter1} → ${permsAfter2})`
    );
    pass = false;
  } else {
    console.log(`PASS: permissions idempotent (${permsAfter1})`);
  }

  if (rolePermsAfter1 !== rolePermsAfter2) {
    console.error(
      `FAIL: role_permissions count changed after 2nd seed (${rolePermsAfter1} → ${rolePermsAfter2})`
    );
    pass = false;
  } else {
    console.log(`PASS: role_permissions idempotent (${rolePermsAfter1})`);
  }

  // Verify expected roles
  const [roleData] = (await db.execute(
    'SELECT name FROM roles ORDER BY id'
  )) as [Row[], unknown];
  const roleNames = roleData.map((r) => String(r['name']));
  console.log(`\nRoles found: ${roleNames.join(', ')}`);

  const expectedRoles = [
    'superadmin',
    'administrator',
    'guru',
    'siswa',
    'alumni',
  ];
  for (const expected of expectedRoles) {
    if (!roleNames.includes(expected)) {
      console.error(`FAIL: expected role "${expected}" not found`);
      pass = false;
    } else {
      console.log(`PASS: role "${expected}" exists`);
    }
  }

  // Verify expected permissions
  const [permData] = (await db.execute(
    'SELECT name FROM permissions ORDER BY name'
  )) as [Row[], unknown];
  const permNames = permData.map((r) => String(r['name']));
  console.log(`\nPermissions found: ${permNames.join(', ')}`);

  const expectedPerms = [
    'users.create',
    'users.read',
    'students.create',
    'students.read',
    'students.update',
    'students.delete',
    'grades.read',
    'announcements.create',
    'announcements.read',
    'payments.read_own',
  ];

  for (const expected of expectedPerms) {
    if (!permNames.includes(expected)) {
      console.error(`FAIL: expected permission "${expected}" not found`);
      pass = false;
    } else {
      console.log(`PASS: permission "${expected}" exists`);
    }
  }

  console.log(`\n=== Result: ${pass ? 'PASS' : 'FAIL'} ===`);
  process.exit(pass ? 0 : 1);
}

main().catch((err) => {
  console.error('Script error:', err);
  process.exit(1);
});
