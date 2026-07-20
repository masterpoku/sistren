// Seed 30 dummy siswa with verified status
import crypto from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { db } from "@/lib/db";
import { accounts, profiles, roles, users } from "@/lib/db/schema";

const NAMES = [
  "Ahmad Fauzi", "Bunga Citra", "Citra Dewi", "Dwiki Darmawan",
  "Eka Putri", "Farhan Hidayat", "Gita Gutawa", "Hendra Gunawan",
  "Indah Permata", "Joko Widodo", "Kartini Ayu", "Lestari Dewi",
  "Muhammad Rizky", "Nurul Aini", "Oscar Pratama", "Putri Ayu",
  "Qurrota Aini", "Rudi Hartono", "Siti Nurhaliza", "Teguh Santoso",
  "Umar Khayam", "Vina Panduwinata", "Wawan Setiawan", "Xaverius Siregar",
  "Yuni Shara", "Zainal Arifin", "Adi Nugroho", "Bella Safira",
  "Candra Wijaya", "Deni Saputra",
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
    const email = `siswa${i + 1}@sister.com`;

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    if (existing) {
      console.log(`⏭️  ${email} already exists`);
      continue;
    }

    // Create user directly (skip better-auth API to be faster)
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
      nik: String(3200000000000000 + i).slice(0, 16),
      nisn: String(1000000000 + i),
      previousSchool: SCHOOLS[i % SCHOOLS.length],
      birthPlace: PLACES[i % PLACES.length],
      birthDate: new Date(2008, i % 12, (i % 28) + 1),
      gender: i % 2 === 0 ? "male" : "female",
      address: `Jl. Contoh No. ${i + 1}, ${PLACES[i % PLACES.length]}`,
      phone: `0812${String(10000000 + i).slice(0, 8)}`,
      fatherName: `Ayah ${name.split(" ")[0]}`,
      fatherOccupation: "Karyawan Swasta",
      motherName: `Ibu ${name.split(" ")[0]}`,
      motherOccupation: "Ibu Rumah Tangga",
      parentsAddress: `Jl. Ortu No. ${i + 1}, ${PLACES[i % PLACES.length]}`,
      parentsPhone: `0813${String(10000000 + i).slice(0, 8)}`,
      verificationStatus: "verified",
    });

    console.log(`✅ ${email} (${name}) — verified`);
    created++;
  }

  console.log(`\nDone. Created ${created} siswa.`);
  console.log(`All passwords: ${password}`);
}

main().catch(console.error);
