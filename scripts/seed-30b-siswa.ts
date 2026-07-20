import crypto from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { db } from "@/lib/db";
import { accounts, profiles, roles, users } from "@/lib/db/schema";

const NAMES = [
  "Agus Salim", "Bayu Pamungkas", "Cici Parmawati", "Dimas Ardiansyah",
  "Elsa Safitri", "Fajar Nugroho", "Galuh Puspita", "Heru Prasetyo",
  "Intan Nuraini", "Jefri Pratama", "Kiki Amalia", "Lia Rahmawati",
  "Mega Sari", "Novi Andriani", "Oni Kurniawan", "Puspa Indah",
  "Rama Septian", "Sari Dewi Lestari", "Toni Gunawan", "Uci Permatasari",
  "Vicky Firmansyah", "Winda Anggraini", "Yoga Pradana", "Zara Azzahra",
  "Anggi Pratiwi", "Bimo Haryanto", "Caca Marlina", "Doni Lesmana",
  "Euis Julianti", "Feri Setiawan",
];

const PLACES = [
  "Jakarta", "Bandung", "Surabaya", "Semarang", "Yogyakarta",
  "Medan", "Makassar", "Palembang", "Denpasar", "Malang",
];

const SCHOOLS = [
  "SMP Negeri 1", "SMP Negeri 2", "SMP Negeri 3", "SMP Negeri 4",
  "SMP Negeri 5", "SMP Negeri 6", "SMP Negeri 7", "SMP Negeri 8",
  "MTs Negeri 1", "MTs Negeri 2",
];

async function main() {
  const [siswaRole] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, "siswa"))
    .limit(1);

  if (!siswaRole) {
    console.log("siswa role not found");
    return;
  }

  let created = 0;
  const password = "password123";
  const passwordHash = await hashPassword(password as string);

  for (let i = 0; i < NAMES.length; i++) {
    const name = NAMES[i];
    const num = i + 31;
    const email = `siswa${num}@sister.com`;

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    if (existing) {
      console.log(`⏭️  ${email} already exists`);
      continue;
    }

    const userId = crypto.randomUUID();
    await db.insert(users).values({
      id: userId,
      name,
      email,
      roleId: siswaRole.id,
      emailVerified: true,
    });
    await db.insert(accounts).values({
      id: crypto.randomUUID(),
      userId,
      providerId: "credential",
      accountId: email,
      password: passwordHash,
    });
    await db.insert(profiles).values({
      userId,
      nik: String(3200000000000000 + num).slice(0, 16),
      nisn: String(1000000000 + num),
      previousSchool: SCHOOLS[num % SCHOOLS.length],
      birthPlace: PLACES[num % PLACES.length],
      birthDate: new Date(2008, num % 12, (num % 28) + 1),
      gender: num % 2 === 0 ? "male" : "female",
      address: `Jl. Contoh No. ${num}, ${PLACES[num % PLACES.length]}`,
      phone: `0812${String(10000000 + num).slice(0, 8)}`,
      fatherName: `Ayah ${name.split(" ")[0]}`,
      fatherOccupation: "Karyawan Swasta",
      motherName: `Ibu ${name.split(" ")[0]}`,
      motherOccupation: "Ibu Rumah Tangga",
      parentsAddress: `Jl. Ortu No. ${num}, ${PLACES[num % PLACES.length]}`,
      parentsPhone: `0813${String(10000000 + num).slice(0, 8)}`,
      verificationStatus: "verified",
    });

    console.log(`✅ ${email} (${name})`);
    created++;
  }

  console.log(`\nDone. Created ${created} siswa. Password: ${password}`);
}

main().catch(console.error);
