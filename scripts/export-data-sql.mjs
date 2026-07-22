import mysql from "mysql2/promise";
import { writeFileSync } from "fs";

const conn = await mysql.createConnection({
  host: "127.0.0.1", port: 3306, user: "root", password: "", database: "sistren",
});

// Get column types for date handling
const [colDefs] = await conn.query(`
  SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'sistren' AND TABLE_NAME IN ('majors','semesters','classes','subjects')
`);
const dateCols = {};
for (const d of colDefs) {
  if (!dateCols[d.TABLE_NAME]) dateCols[d.TABLE_NAME] = [];
  if (d.DATA_TYPE === "date") dateCols[d.TABLE_NAME].push(d.COLUMN_NAME);
}

let sql = "-- Data: majors, classes, subjects, semesters\n";
sql += "-- Untuk import ke cPanel\n\n";
sql += "SET FOREIGN_KEY_CHECKS=0;\n\n";

const tables = ["majors", "semesters", "classes", "subjects"];

for (const table of tables) {
  const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
  if (rows.length === 0) continue;

  const cols = Object.keys(rows[0]);
  const colList = cols.map(c => `\`${c}\``).join(", ");

  sql += `-- ${table} (${rows.length} rows)\n`;
  for (const row of rows) {
    const vals = cols.map(c => {
      const v = row[c];
      if (v === null || v === undefined) return "NULL";
      if (v instanceof Date) {
        if (!isNaN(v.getTime())) {
          if (dateCols[table]?.includes(c)) {
            // DATE column — format YYYY-MM-DD only (avoid TZ offset issue)
            const y = v.getFullYear();
            const m = String(v.getMonth() + 1).padStart(2, "0");
            const d = String(v.getDate()).padStart(2, "0");
            return `'${y}-${m}-${d}'`;
          }
          return `'${v.toISOString().slice(0, 19).replace("T", " ")}'`;
        }
        return "NULL";
      }
      return `'${String(v).replace(/'/g, "\\'")}'`;
    });
    sql += `INSERT IGNORE INTO \`${table}\` (${colList}) VALUES (${vals.join(", ")});\n`;
  }
  sql += "\n";
}

sql += "SET FOREIGN_KEY_CHECKS=1;\n";

writeFileSync("/home/maswafi/css-id/atik/sistren_next/majors-classes-subjects-data.sql", sql);
console.log("Written:", sql.length, "bytes");

await conn.end();
