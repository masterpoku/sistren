import { db } from '../src/lib/db/index';
import * as schema from '../src/lib/db/schema';

async function verifySeed() {
  try {
    const roles = await db.select().from(schema.roles);
    console.log('👥 Roles:', roles);

    const majors = await db.select().from(schema.majors);
    console.log('🎓 Majors:', majors);
    
    const paymentMethods = await db.select().from(schema.paymentMethods);
    console.log('💳 Payment Methods:', paymentMethods);
    
    console.log('\n✅ All seed data verified!');
  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  }
}

verifySeed();
