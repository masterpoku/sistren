/**
 * Drops and recreates the database.
 * Run: bun run db:reset yes
 */

import mysql from "mysql2/promise";

async function main() {
  const dbName = process.env.DB_NAME ?? "sistren";
  const dbHost = process.env.DB_HOST ?? "localhost";
  const dbPort = Number(process.env.DB_PORT) ?? 3306;
  const dbUser = process.env.DB_USER ?? "root";
  const dbPass = process.env.DB_PASSWORD ?? "root";

  if (process.argv[2] !== "yes") {
    console.log("Aborted. Run: bun run db:reset yes");
    return;
  }

  console.log(`Dropping '${dbName}'...`);
  const conn = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPass,
  });

  await conn.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
  console.log(`Creating '${dbName}'...`);
  await conn.query(
    `CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci`
  );
  await conn.end();
  console.log("Done. Now run: bun run db:push && bun run db:seed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
