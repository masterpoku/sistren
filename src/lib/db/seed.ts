/**
 * Main seed script — creates base data needed for the app to function.
 *
 * Order:
 * 1. Roles (must exist before users can reference them)
 * 2. Permissions (must exist before role_permissions can be created)
 * 3. Role-permission assignments
 * 4. Test users with roleId set via Drizzle (better-auth createUser can't set additionalFields)
 *
 * Run: bun run db:seed
 */

import { and, eq, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "./index";
import { PERMISSIONS, ROLE_ENTRIES, ROLE_PERMISSIONS } from "./permissions";
import {
  calendarEvents,
  notifications,
  permissions,
  religions,
  rolePermissions,
  roles,
  systemConfigs,
  users,
} from "./schema";
import { SYSTEM_CONFIG_KEYS } from "./system-config-keys";

const religionNames = [
  "Islam",
  "Kristen",
  "Katolik",
  "Hindu",
  "Budha",
  "Konghucu",
];

async function seedReligions() {
  console.log("\n--- Seeding religions ---");
  for (const name of religionNames) {
    const [existing] = await db
      .select({ id: religions.id })
      .from(religions)
      .where(and(eq(religions.name, name), isNull(religions.deletedAt)))
      .limit(1);

    if (existing) {
      console.log(`⏭️  Religion '${name}' already exists`);
      continue;
    }

    await db.insert(religions).values({ name });
    console.log(`✅ Seeded religion: ${name}`);
  }
}

async function seed() {
  console.log("🌱 Starting main seed...");

  await seedReligions();
  await seedCalendarEvents();
  await seedSystemConfigs();

  console.log("\n--- Seeding roles ---");
  const roleMap: Record<string, number> = {};
  for (const entry of ROLE_ENTRIES) {
    const [existing] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(and(eq(roles.name, entry.name), isNull(roles.deletedAt)))
      .limit(1);

    if (existing) {
      console.log(`⏭️  Role '${entry.name}' already exists`);
      roleMap[entry.name] = Number(existing.id);
    } else {
      const [softDeleted] = await db
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.name, entry.name))
        .limit(1);

      if (softDeleted) {
        await db
          .update(roles)
          .set({ deletedAt: null })
          .where(eq(roles.id, softDeleted.id));
        console.log(`♻️  Role '${entry.name}' restored from soft-delete`);
      } else {
        await db.insert(roles).values(entry);
      }

      const [fetched] = await db
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.name, entry.name))
        .limit(1);
      console.log(`✅ Seeded role: ${entry.name} (id=${fetched.id})`);
      roleMap[entry.name] = Number(fetched.id);
    }
  }

  console.log("\n--- Seeding permissions ---");
  const permMap: Record<string, number> = {};
  for (const entry of PERMISSIONS) {
    const [existing] = await db
      .select({ id: permissions.id })
      .from(permissions)
      .where(
        and(eq(permissions.name, entry.name), isNull(permissions.deletedAt))
      )
      .limit(1);

    if (existing) {
      console.log(`⏭️  Permission '${entry.name}' already exists`);
      permMap[entry.name] = Number(existing.id);
    } else {
      const [softDeleted] = await db
        .select({ id: permissions.id })
        .from(permissions)
        .where(eq(permissions.name, entry.name))
        .limit(1);

      if (softDeleted) {
        await db
          .update(permissions)
          .set({ deletedAt: null })
          .where(eq(permissions.id, softDeleted.id));
        console.log(`♻️  Permission '${entry.name}' restored`);
      } else {
        await db.insert(permissions).values({ ...entry, deletedAt: null });
        console.log(`✅ Seeded permission: ${entry.name}`);
      }

      const [fetched] = await db
        .select({ id: permissions.id })
        .from(permissions)
        .where(eq(permissions.name, entry.name))
        .limit(1);
      permMap[entry.name] = Number(fetched.id);
    }
  }

  console.log("\n--- Assigning permissions to roles ---");
  for (const [roleName, permNames] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleMap[roleName];
    if (!roleId) {
      console.log(`⏭️  Role '${roleName}' not found, skipping`);
      continue;
    }

    for (const permName of permNames) {
      const permId = permMap[permName];
      if (!permId) {
        console.log(`⏭️  Permission '${permName}' not found, skipping`);
        continue;
      }

      const [existing] = await db
        .select({ roleId: rolePermissions.roleId })
        .from(rolePermissions)
        .innerJoin(roles, eq(rolePermissions.roleId, roles.id))
        .innerJoin(
          permissions,
          eq(rolePermissions.permissionId, permissions.id)
        )
        .where(
          and(
            eq(rolePermissions.roleId, roleId),
            eq(rolePermissions.permissionId, permId),
            isNull(rolePermissions.deletedAt),
            isNull(roles.deletedAt),
            isNull(permissions.deletedAt)
          )
        )
        .limit(1);

      if (existing) {
        continue;
      }

      const [softDel] = await db
        .select({ roleId: rolePermissions.roleId })
        .from(rolePermissions)
        .where(
          and(
            eq(rolePermissions.roleId, roleId),
            eq(rolePermissions.permissionId, permId)
          )
        )
        .limit(1);

      if (softDel) {
        await db
          .update(rolePermissions)
          .set({ deletedAt: null })
          .where(
            and(
              eq(rolePermissions.roleId, roleId),
              eq(rolePermissions.permissionId, permId)
            )
          );
        console.log(
          `♻️  Restored permission '${permName}' to role '${roleName}'`
        );
      } else {
        await db
          .insert(rolePermissions)
          .values({ roleId, permissionId: permId });
        console.log(`✅ Assigned '${permName}' to '${roleName}'`);
      }
    }
  }

  console.log("\n--- Creating test users ---");

  const testUsers = [
    {
      email: "superadmin@sister.com",
      password: "Password123!",
      name: "Super Admin",
      role: "superadmin",
    },
    {
      email: "admin@sister.com",
      password: "Password123!",
      name: "Administrator",
      role: "administrator",
    },
    {
      email: "guru@sister.com",
      password: "Password123!",
      name: "Guru Honorer",
      role: "guru",
    },
    {
      email: "siswa@sister.com",
      password: "Password123!",
      name: "Siswa Demo",
      role: "siswa",
    },
    {
      email: "alumni@sister.com",
      password: "Password123!",
      name: "Alumni Demo",
      role: "alumni",
    },
  ];

  for (const { email, password, name, role } of testUsers) {
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    if (existingUser) {
      console.log(`⏭️  User '${email}' already exists`);
      continue;
    }

    const user = await auth.api.signUpEmail({
      body: { email, password, name },
    });

    const userId = ("id" in user ? user.id : user.user.id) as string;
    console.log(`✅ Created user: ${email} (id=${userId})`);

    const roleId = roleMap[role];
    if (roleId) {
      await db.update(users).set({ roleId }).where(eq(users.id, userId));
      console.log(`✅ Set roleId=${roleId} (${role}) for ${email}`);
    } else {
      console.log(`⚠️  Role '${role}' not found for ${email}, skipping roleId`);
    }
  }

  console.log("\n🎉 Seed completed");
}

async function seedSystemConfigs() {
  console.log("\n--- Seeding system configs ---");

  const configs: Array<{ key: string; value: string; description: string }> = [
    {
      key: SYSTEM_CONFIG_KEYS.SCHOOL_NAME,
      value: "SMK Terpadu",
      description: "Nama resmi sekolah",
    },
    {
      key: SYSTEM_CONFIG_KEYS.SCHOOL_ADDRESS,
      value: "Jl. Pendidikan No. 1, Kota",
      description: "Alamat lengkap sekolah",
    },
    {
      key: SYSTEM_CONFIG_KEYS.HEADMASTER,
      value: "Drs. Kepala Sekolah",
      description: "Nama kepala sekolah aktif",
    },
    {
      key: SYSTEM_CONFIG_KEYS.NPSN,
      value: "12345678",
      description: "Nomor Pokok Sekolah Nasional",
    },
    {
      key: SYSTEM_CONFIG_KEYS.NSS,
      value: "123456789012",
      description: "Nomor Statistik Sekolah",
    },
    {
      key: SYSTEM_CONFIG_KEYS.ACADEMIC_YEAR,
      value: "2025/2026",
      description: "Tahun ajaran aktif",
    },
    {
      key: SYSTEM_CONFIG_KEYS.CURRENT_SEMESTER_ID,
      value: "1",
      description: "ID semester aktif (foreign reference)",
    },
    {
      key: SYSTEM_CONFIG_KEYS.SPP_DEFAULT_AMOUNT,
      value: "250000",
      description: "Nominal SPP default per bulan (rupiah)",
    },
    {
      key: SYSTEM_CONFIG_KEYS.SPP_DUE_DAY,
      value: "10",
      description: "Tanggal jatuh tempo SPP (1-31)",
    },
    {
      key: SYSTEM_CONFIG_KEYS.PAYMENT_GRACE_DAYS,
      value: "7",
      description: "Toleransi keterlambatan (hari)",
    },
    {
      key: SYSTEM_CONFIG_KEYS.MIN_SCORE,
      value: "0",
      description: "Nilai minimum",
    },
    {
      key: SYSTEM_CONFIG_KEYS.MAX_SCORE,
      value: "100",
      description: "Nilai maksimum",
    },
    {
      key: SYSTEM_CONFIG_KEYS.PASSING_SCORE,
      value: "75",
      description: "Nilai minimum kelulusan",
    },
  ];

  for (const c of configs) {
    const [existing] = await db
      .select({ id: systemConfigs.id })
      .from(systemConfigs)
      .where(
        and(eq(systemConfigs.key, c.key), isNull(systemConfigs.deletedAt))
      )
      .limit(1);

    if (existing) {
      console.log(`⏭️  Config '${c.key}' already exists`);
      continue;
    }

    await db.insert(systemConfigs).values({
      key: c.key,
      value: c.value,
      description: c.description,
    });
    console.log(`✅ Seeded config: ${c.key}`);
  }
}

async function seedCalendarEvents() {
  console.log("\n--- Seeding sample calendar events ---");

  const sampleEvents = [
    {
      title: "Awal Semester Genap 2025/2026",
      description: "Hari pertama semester genap tahun ajaran 2025/2026",
      startAt: new Date("2026-01-15T00:00:00"),
      endAt: null,
      allDay: true,
      category: "academic" as const,
      isPublic: true,
    },
    {
      title: "Ujian Tengah Semester",
      description: "Minggu ujian tengah semester genap",
      startAt: new Date("2026-03-10T00:00:00"),
      endAt: new Date("2026-03-15T23:59:59"),
      allDay: false,
      category: "exam" as const,
      isPublic: true,
    },
    {
      title: "Libur Hari Raya Idul Fitri",
      description: "Libur nasional Hari Raya Indah",
      startAt: new Date("2026-03-20T00:00:00"),
      endAt: new Date("2026-03-25T23:59:59"),
      allDay: true,
      category: "holiday" as const,
      isPublic: true,
    },
    {
      title: "Rapat Guru",
      description: "Rapat koordinasi bulanan guru dan staff",
      startAt: new Date("2026-06-15T13:00:00"),
      endAt: new Date("2026-06-15T15:00:00"),
      allDay: false,
      category: "meeting" as const,
      isPublic: false,
    },
    {
      title: "Pentas Seni",
      description: "Pentas seni tahunan sekolah",
      startAt: new Date("2026-07-20T00:00:00"),
      endAt: null,
      allDay: true,
      category: "event" as const,
      isPublic: true,
    },
    {
      title: "Ujian Akhir Semester",
      description: "Minggu ujian akhir semester genap",
      startAt: new Date("2026-06-25T00:00:00"),
      endAt: new Date("2026-06-30T23:59:59"),
      allDay: false,
      category: "exam" as const,
      isPublic: true,
    },
  ];

  for (const event of sampleEvents) {
    const [existing] = await db
      .select({ id: calendarEvents.id })
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.title, event.title),
          isNull(calendarEvents.deletedAt)
        )
      )
      .limit(1);

    if (existing) {
      console.log(`⏭️  Event '${event.title}' already exists`);
      continue;
    }

    await db.insert(calendarEvents).values(event);
    console.log(`✅ Seeded event: ${event.title}`);
  }

  // Seed demo notifications for superadmin
  const [superadmin] = await db
    .select({ id: users.id })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(and(eq(roles.level, 100), isNull(users.deletedAt)))
    .limit(1);

  if (superadmin) {
    const sampleNotifications = [
      {
        userId: superadmin.id,
        title: "Selamat Datang di Sistren",
        message: "Sistem Informasi Sekolah siap digunakan.",
        type: "system" as const,
      },
      {
        userId: superadmin.id,
        title: "Pengingat: Tahun Ajaran Baru",
        message: "Mohon perbarui semester aktif untuk tahun ajaran 2026/2027.",
        type: "system" as const,
      },
    ];

    for (const n of sampleNotifications) {
      const [existing] = await db
        .select({ id: notifications.id })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, n.userId),
            eq(notifications.title, n.title)
          )
        )
        .limit(1);

      if (existing) {
        console.log(`⏭️  Notification '${n.title}' already exists`);
        continue;
      }

      await db.insert(notifications).values(n);
      console.log(`✅ Seeded notification: ${n.title}`);
    }
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
