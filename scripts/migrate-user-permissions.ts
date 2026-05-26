import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);

  // Step 3: Add unique index (column already varchar(36), no garbage found)
  console.log('=== STEP 3: Add unique index ===');
  try {
    await db.execute(
      sql`ALTER TABLE user_permissions ADD UNIQUE INDEX idx_user_permission (user_id, permission_id)`
    );
    console.log('Unique index added');
  } catch (e: any) {
    if (e.message?.includes('Duplicate')) {
      console.log('Unique index already exists — skipped');
    } else {
      throw e;
    }
  }

  // Step 4: Verify final state
  console.log('\n=== STEP 4: Verify final state ===');
  const [final] = await db.execute(sql`SHOW CREATE TABLE user_permissions`);
  console.log(JSON.stringify(final, null, 2));
  const [indexes] = await db.execute(sql`SHOW INDEX FROM user_permissions`);
  console.log(JSON.stringify(indexes, null, 2));

  console.log('\n✅ All done');
}

main().catch(console.error);
