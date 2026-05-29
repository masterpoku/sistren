import { db, pool } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { enrollments } from '@/lib/db/schema';

async function migrate() {
  console.log('Starting migration: add unique constraint to enrollments');

  try {
    // Check for existing duplicate data - use raw sql
    const result = await db.execute(
      sql`
      SELECT student_id, semester_id, COUNT(*) as cnt 
      FROM enrollments 
      WHERE deleted_at IS NULL 
      GROUP BY student_id, semester_id 
      HAVING COUNT(*) > 1
    ` as any
    );

    // Check if we have actual duplicate rows
    const rows = result.rows || [];
    if (rows.length > 0) {
      console.error(
        'ERROR: Found duplicate enrollments. Cannot add unique constraint.'
      );
      console.error('Duplicate pairs:', JSON.stringify(rows, null, 2));
      console.error('Please resolve duplicates before adding constraint.');
      await pool.end();
      process.exit(1);
    }

    // Add unique constraint
    console.log('Adding unique constraint on (student_id, semester_id)...');
    await db.execute(
      sql`
      ALTER TABLE enrollments 
      ADD CONSTRAINT enrollments_student_id_semester_id_unique 
      UNIQUE(student_id, semester_id)
    ` as any
    );

    console.log('✅ Migration complete: unique constraint added');
  } catch (error: any) {
    if (error.message?.includes('Duplicate') || error.code === '23000') {
      console.error(
        'ERROR: Duplicate data exists or constraint already exists.'
      );
      await pool.end();
      process.exit(1);
    }
    console.error('Migration failed:', error.message);
    await pool.end();
    throw error;
  }

  await pool.end();
}

migrate();
