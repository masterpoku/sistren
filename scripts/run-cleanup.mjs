import mysql from "mysql2/promise";
import { readFileSync } from "fs";

const sql = readFileSync(
  "/home/maswafi/css-id/atik/sistren_next/hapus-siswa-kelas-mapel.sql",
  "utf-8"
);

const conn = await mysql.createConnection({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "",
  database: "sistren",
  multipleStatements: true,
});

console.log("Running cleanup SQL...");
await conn.query(sql);
console.log("Done.");
await conn.end();
