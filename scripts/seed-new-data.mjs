import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "",
  database: "sistren",
});

console.log("Connected. Seeding new data...\n");

// ── Majors ──
const majors = [
  { name: "Teknik Jaringan Komputer dan Telekomunikasi", code: "TJKT" },
  { name: "Desain Komunikasi Visual", code: "DKV" },
  { name: "Teknik Kendaraan Ringan Otomotif", code: "TKRO" },
];

for (const m of majors) {
  await conn.execute(
    "INSERT IGNORE INTO majors (name, description) VALUES (?, ?)",
    [m.name, m.code]
  );
  console.log(`+ major: ${m.name} (${m.code})`);
}

const [majorRows] = await conn.query("SELECT id, description FROM majors");
const majorMap = {};
for (const r of majorRows) majorMap[r.description] = r.id;

// ── Classes ──
const levels = ["X", "XI", "XII"];
const majorCodes = ["TJKT", "DKV", "TKRO"];
let classId = 0;
const classMap = {};

for (const level of levels) {
  for (const code of majorCodes) {
    classId++;
    const name = `${level} ${code}`;
    await conn.execute(
      "INSERT IGNORE INTO classes (id, name, code, major_id) VALUES (?, ?, ?, ?)",
      [classId, name, name, majorMap[code]]
    );
    classMap[name] = classId;
    console.log(`+ class: ${name}`);
  }
}

// ── Semesters ──
await conn.execute(
  "INSERT IGNORE INTO semesters (id, name, academic_year, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?, ?)",
  [1, "Ganjil", "2025/2026", "2025-07-14", "2025-12-20", 1]
);
console.log("+ semester: Ganjil 2025/2026 (active)");
await conn.execute(
  "INSERT IGNORE INTO semesters (id, name, academic_year, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?, ?)",
  [2, "Genap", "2025/2026", "2026-01-05", "2026-06-20", 0]
);
console.log("+ semester: Genap 2025/2026");

// ── General Subjects (for every class) ──
const generalSubjects = [
  "Amtsilati", "Akhlaq", "Fiqih", "Nahwu", "PAI & BP",
  "B. Indonesia", "Bahasa Inggris", "Conversation", "Matematika",
  "Seni Tari", "PKN", "Projek IPAS", "Sejarah", "BK",
  "Informatika", "KKA", "Penjaskes", "PKWU",
];

const [maxSubj] = await conn.query("SELECT COALESCE(MAX(id),0) as maxId FROM subjects");
let subjId = Number(maxSubj[0].maxId);

for (const level of levels) {
  for (const code of majorCodes) {
    const className = `${level} ${code}`;
    const cId = classMap[className];
    for (const subj of generalSubjects) {
      subjId++;
      const gSubjCode = `${level}-${subj.replace(/[^a-zA-Z0-9]/g, "").substring(0, 20)}-${code}`;
      await conn.execute(
        "INSERT IGNORE INTO subjects (id, name, code, class_id, major_id) VALUES (?, ?, ?, ?, ?)",
        [subjId, subj, gSubjCode, cId, null]
      );
    }
  }
}
console.log(`+ ${generalSubjects.length} general subjects x 9 classes`);

// ── Specialized Subjects ──
const specialized = {
  TJKT: [
    "Dasar-dasar TJKT",
    "Perencanaan dan Pengalamatan Jaringan",
    "Teknologi Jaringan Kabel dan Nirkabel",
    "Konfigurasi Perangkat Jaringan",
    "Keamanan Jaringan",
    "Administrasi Sistem Jaringan",
  ],
  DKV: [
    "Dasar-dasar DKV",
    "Perangkat Lunak Desain",
    "Desain Publikasi",
    "Menerapkan Desain Brief",
    "Komputer Grafis",
    "Fotografi",
    "Vidiografi",
    "Karya Desain",
  ],
  TKRO: [
    "Proses Pelayanan dan Manajemen Bengkel Kendaraan",
    "Prosedur Penggunaan Kendaraan Ringan",
    "Perawatan Berkala Kendaraan Ringan",
    "Sistem Engine Kendaraan Ringan",
    "Sistem Elektrikal Kendaraan Ringan",
    "Sistem Pengamanan dan Sistem Kontrol",
  ],
};

for (const code of majorCodes) {
  const subs = specialized[code];
  for (const level of levels) {
    const className = `${level} ${code}`;
    const cId = classMap[className];
    for (const subj of subs) {
      subjId++;
      const codeTag = subj.replace(/[^a-zA-Z0-9]/g, "").substring(0, 25);
      const subjCode = `${level}-${code}-${codeTag}`;
      await conn.execute(
        "INSERT IGNORE INTO subjects (id, name, code, class_id, major_id) VALUES (?, ?, ?, ?, ?)",
        [subjId, subj, subjCode, cId, majorMap[code]]
      );
    }
  }
}
console.log(`+ specialized subjects per major per class`);

// ── Summary ──
const [majorC] = await conn.query("SELECT COUNT(*) as c FROM majors");
const [classC] = await conn.query("SELECT COUNT(*) as c FROM classes");
const [subjC] = await conn.query("SELECT COUNT(*) as c FROM subjects");
const [semC] = await conn.query("SELECT COUNT(*) as c FROM semesters");
console.log(`\n=== Summary ===`);
console.log(`Majors:    ${majorC[0].c}`);
console.log(`Classes:   ${classC[0].c}`);
console.log(`Subjects:  ${subjC[0].c}`);
console.log(`Semesters: ${semC[0].c}`);

await conn.end();
console.log("\nDone.");
