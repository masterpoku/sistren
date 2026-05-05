import { db } from '../src/lib/db/index';
import * as schema from '../src/lib/db/schema';

async function testConnection() {
  try {
    // Simple query to test connection
    const result = await db.execute('SELECT 1 as test');
    console.log('✅ Database connection successful:', result);
    
    // Check if tables exist
    const tables = await db.execute('SHOW TABLES');
    console.log('📋 Existing tables:', tables);
    
    // Test a query on roles table
    const roles = await db.select().from(schema.roles).limit(5);
    console.log('👥 Roles:', roles);
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    throw error;
  }
}

testConnection();
