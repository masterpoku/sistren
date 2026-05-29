/**
 * Reset database — DROP and recreate sistren database.
 * WARNING: This deletes ALL data. Cannot be undone.
 */

import { createConnection } from 'mysql2/promise';

async function resetDb() {
  const connection = await createConnection({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT) ?? 3306,
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? 'root',
  });

  console.log('🔴 Dropping database `sistren`...');
  await connection.query('DROP DATABASE IF EXISTS `sistren`');

  console.log('🟢 Creating database `sistren`...');
  await connection.query('CREATE DATABASE `sistren` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');

  console.log('✅ Database reset complete. Run `bun run db:migrate` next.');
  await connection.end();
}

resetDb().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});