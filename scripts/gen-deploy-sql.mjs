import mysql from "mysql2/promise";
import { hashPassword } from "@better-auth/utils/password";
import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";

const conn = await mysql.createConnection({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "",
  database: "sistren",
});

// 1. Dump structure (CREATE TABLE) for every table
const [tables] = await conn.query("SHOW TABLES");
const tableNames = tables.map((t) => Object.values(t)[0]);
let sql = "-- Sistren schema (structure only) + superadmin\n";
sql += "-- Generated for import into cPanel MariaDB (sisk7554_dev)\n\n";
sql += "SET FOREIGN_KEY_CHECKS=0;\n\n";

for (const name of tableNames) {
  const [rows] = await conn.query(`SHOW CREATE TABLE \`${name}\``);
  sql += rows[0]["Create Table"] + ";\n\n";
}

// 2. superadmin data
const roleId = 1; // superadmin biasanya id 1; akan di-insert jika belum ada
const userId = randomUUID();
const email = "superadmin@sister.com";
const name = "Super Admin";
const plain = "Password123!";
const hashed = await hashPassword(plain);
const now = new Date().toISOString().slice(0, 19).replace("T", " ");

sql += "-- Ensure superadmin role exists (level 100)\n";
sql += `INSERT IGNORE INTO roles (id, name, description, is_default, level, created_at, updated_at) VALUES (1, 'superadmin', 'Super Administrator', 0, 100, '${now}', '${now}');\n`;
sql += `INSERT IGNORE INTO roles (id, name, description, is_default, level, created_at, updated_at) VALUES (2, 'administrator', 'Administrator', 0, 80, '${now}', '${now}');\n`;
sql += `INSERT IGNORE INTO roles (id, name, description, is_default, level, created_at, updated_at) VALUES (3, 'guru', 'Guru', 0, 60, '${now}', '${now}');\n`;
sql += `INSERT IGNORE INTO roles (id, name, description, is_default, level, created_at, updated_at) VALUES (4, 'siswa', 'Siswa', 1, 40, '${now}', '${now}');\n`;
sql += `INSERT IGNORE INTO roles (id, name, description, is_default, level, created_at, updated_at) VALUES (5, 'alumni', 'Alumni', 0, 20, '${now}', '${now}');\n\n`;

sql += "-- Superadmin user\n";
sql += `INSERT IGNORE INTO users (id, name, email, email_verified, password, role_id, created_at, updated_at) VALUES ('${userId}', '${name}', '${email}', 1, '${hashed}', 1, '${now}', '${now}');\n`;
sql += `-- account (better-auth credential). user_id = '${userId}'\n`;
sql += `INSERT IGNORE INTO accounts (id, user_id, provider_id, account_id, password, created_at, updated_at) VALUES ('${randomUUID()}', '${userId}', 'credential', '${email}', '${hashed}', '${now}', '${now}');\n\n`;

sql += "SET FOREIGN_KEY_CHECKS=1;\n";

writeFileSync("/home/maswafi/css-id/atik/sistren_next/sistren-schema-and-superadmin.sql", sql);
console.log("Written SQL. superadmin email:", email, "password:", plain);
console.log("user id:", userId);
await conn.end();
