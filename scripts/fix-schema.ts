import { db } from '../src/lib/db/index'
import { sql } from 'drizzle-orm'

async function applyMigrations() {
  console.log('🔧 Applying schema fixes...')

  try {
    console.log('➕ Adding is_default column to roles...')
    await db.execute(sql`ALTER TABLE roles ADD COLUMN is_default boolean DEFAULT false`)
    console.log('✅ Added is_default column')
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️  is_default column already exists')
    } else {
      console.error('❌ Error adding is_default:', error.code, error.message)
    }
  }

  try {
    console.log('➕ Adding level column to roles...')
    await db.execute(sql`ALTER TABLE roles ADD COLUMN level int DEFAULT 0`)
    console.log('✅ Added level column')
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️  level column already exists')
    } else {
      console.error('❌ Error adding level:', error.code, error.message)
    }
  }

  console.log('🎉 Schema fixes applied!')
}

applyMigrations()