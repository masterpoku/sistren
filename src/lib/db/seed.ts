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
import {
  permissions,
  religions,
  rolePermissions,
  roles,
  users,
} from "./schema";

// ==================== REFERENCE DATA ====================

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
const roleEntries = [
  { name: "superadmin", description: "Full system access", level: 100 },
  { name: "administrator", description: "Admin staff (TU)", level: 80 },
  { name: "guru", description: "Teacher", level: 60 },
  { name: "siswa", description: "Student", level: 40 },
  { name: "alumni", description: "Alumni (read-only)", level: 20 },
];

// ==================== PERMISSIONS ====================
const permEntries = [
  {
    name: "users.create",
    description: "Create users",
    resource: "users",
    action: "create",
  },
  {
    name: "users.read",
    description: "Read users",
    resource: "users",
    action: "read",
  },
  {
    name: "users.update",
    description: "Update users",
    resource: "users",
    action: "update",
  },
  {
    name: "users.delete",
    description: "Delete users",
    resource: "users",
    action: "delete",
  },
  {
    name: "students.create",
    description: "Create student records",
    resource: "students",
    action: "create",
  },
  {
    name: "students.read",
    description: "Read student records",
    resource: "students",
    action: "read",
  },
  {
    name: "students.update",
    description: "Update student records",
    resource: "students",
    action: "update",
  },
  {
    name: "students.delete",
    description: "Delete student records",
    resource: "students",
    action: "delete",
  },
  {
    name: "students.promote",
    description: "Promote students",
    resource: "students",
    action: "promote",
  },
  {
    name: "students.graduate",
    description: "Graduate students",
    resource: "students",
    action: "graduate",
  },
  {
    name: "students.import",
    description: "Import students",
    resource: "students",
    action: "import",
  },
  {
    name: "teachers.create",
    description: "Create teacher records",
    resource: "teachers",
    action: "create",
  },
  {
    name: "teachers.read",
    description: "Read teacher records",
    resource: "teachers",
    action: "read",
  },
  {
    name: "teachers.update",
    description: "Update teacher records",
    resource: "teachers",
    action: "update",
  },
  {
    name: "teachers.delete",
    description: "Delete teacher records",
    resource: "teachers",
    action: "delete",
  },
  {
    name: "teachers.assign_class",
    description: "Assign teachers to classes",
    resource: "teachers",
    action: "assign_class",
  },
  {
    name: "teachers.assign_subject",
    description: "Assign teachers to subjects",
    resource: "teachers",
    action: "assign_subject",
  },
  {
    name: "classes.manage",
    description: "Manage classes",
    resource: "classes",
    action: "manage",
  },
  {
    name: "majors.manage",
    description: "Manage majors",
    resource: "majors",
    action: "manage",
  },
  {
    name: "subjects.manage",
    description: "Manage subjects",
    resource: "subjects",
    action: "manage",
  },
  {
    name: "semesters.manage",
    description: "Manage semesters",
    resource: "semesters",
    action: "manage",
  },
  {
    name: "enrollments.create",
    description: "Create enrollments",
    resource: "enrollments",
    action: "create",
  },
  {
    name: "enrollments.read",
    description: "Read enrollments",
    resource: "enrollments",
    action: "read",
  },
  {
    name: "enrollments.update",
    description: "Update enrollments",
    resource: "enrollments",
    action: "update",
  },
  {
    name: "enrollments.delete",
    description: "Delete enrollments",
    resource: "enrollments",
    action: "delete",
  },
  {
    name: "grades.input",
    description: "Input grades",
    resource: "grades",
    action: "input",
  },
  {
    name: "grades.read_any",
    description: "Read any grades",
    resource: "grades",
    action: "read_any",
  },
  {
    name: "grades.read_own",
    description: "Read own grades",
    resource: "grades",
    action: "read_own",
  },
  {
    name: "grades.print",
    description: "Print grade reports",
    resource: "grades",
    action: "print",
  },
  {
    name: "announcements.create",
    description: "Create announcements",
    resource: "announcements",
    action: "create",
  },
  {
    name: "announcements.read",
    description: "Read announcements",
    resource: "announcements",
    action: "read",
  },
  {
    name: "announcements.update",
    description: "Update announcements",
    resource: "announcements",
    action: "update",
  },
  {
    name: "announcements.delete",
    description: "Delete announcements",
    resource: "announcements",
    action: "delete",
  },
  {
    name: "announcements.publish",
    description: "Publish announcements",
    resource: "announcements",
    action: "publish",
  },
  {
    name: "payments.create",
    description: "Create payments",
    resource: "payments",
    action: "create",
  },
  {
    name: "payments.read_any",
    description: "Read any payments",
    resource: "payments",
    action: "read_any",
  },
  {
    name: "payments.read_own",
    description: "Read own payments",
    resource: "payments",
    action: "read_own",
  },
  {
    name: "payments.update",
    description: "Update payments",
    resource: "payments",
    action: "update",
  },
  {
    name: "payments.approve",
    description: "Approve payments",
    resource: "payments",
    action: "approve",
  },
  {
    name: "payments.generate_report",
    description: "Generate payment reports",
    resource: "payments",
    action: "generate_report",
  },
  {
    name: "payment_methods.manage",
    description: "Manage payment methods",
    resource: "payment_methods",
    action: "manage",
  },
  {
    name: "system_configs.manage",
    description: "Manage system configs",
    resource: "system_configs",
    action: "manage",
  },
  {
    name: "profile.edit_own",
    description: "Edit own profile",
    resource: "profile",
    action: "edit_own",
  },
  {
    name: "profile.edit_any",
    description: "Edit any profile",
    resource: "profile",
    action: "edit_any",
  },
  {
    name: "profile.assets.upload",
    description: "Upload profile assets",
    resource: "profile",
    action: "assets_upload",
  },
];

// ==================== ROLE PERMISSION ASSIGNMENTS ====================
const rolePermAssignments: Record<string, string[]> = {
  superadmin: permEntries.map((p) => p.name),
  administrator: [
    "users.create",
    "users.read",
    "users.update",
    "students.create",
    "students.read",
    "students.update",
    "students.delete",
    "students.promote",
    "students.graduate",
    "students.import",
    "teachers.create",
    "teachers.read",
    "teachers.update",
    "teachers.delete",
    "teachers.assign_class",
    "teachers.assign_subject",
    "classes.manage",
    "majors.manage",
    "subjects.manage",
    "semesters.manage",
    "enrollments.create",
    "enrollments.read",
    "enrollments.update",
    "enrollments.delete",
    "grades.input",
    "grades.read_any",
    "grades.read_own",
    "grades.print",
    "announcements.create",
    "announcements.read",
    "announcements.update",
    "announcements.delete",
    "announcements.publish",
    "payments.create",
    "payments.read_any",
    "payments.read_own",
    "payments.update",
    "payments.approve",
    "payments.generate_report",
    "payment_methods.manage",
    "system_configs.manage",
    "profile.edit_own",
    "profile.edit_any",
    "profile.assets.upload",
  ],
  guru: [
    "grades.input",
    "grades.read_any",
    "students.read",
    "announcements.read",
    "profile.edit_own",
    "subjects.manage",
    "teachers.read",
    "classes.manage",
    "majors.manage",
    "semesters.manage",
    "enrollments.read",
  ],
  siswa: [
    "grades.read_own",
    "announcements.read",
    "profile.edit_own",
    "students.read",
    "payments.read_own",
    "enrollments.read",
  ],
  alumni: ["grades.read_own", "profile.edit_own"],
};

async function seed() {
  console.log("🌱 Starting main seed...");

  // ==================== RELIGIONS ====================
  await seedReligions();

  // ==================== ROLES ====================
  console.log("\n--- Seeding roles ---");
  const roleMap: Record<string, number> = {};
  for (const entry of roleEntries) {
    const [existing] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(and(eq(roles.name, entry.name), isNull(roles.deletedAt)))
      .limit(1);

    if (existing) {
      console.log(`⏭️  Role '${entry.name}' already exists`);
      roleMap[entry.name] = Number(existing.id);
    } else {
      // Check soft-deleted
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
        // Re-fetch for mapping
        const [fetched] = await db
          .select({ id: roles.id })
          .from(roles)
          .where(eq(roles.name, entry.name))
          .limit(1);
        console.log(`✅ Seeded role: ${entry.name} (id=${fetched.id})`);
      }

      // Re-fetch for mapping
      const [fetched] = await db
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.name, entry.name))
        .limit(1);
      roleMap[entry.name] = Number(fetched.id);
    }
  }

  // ==================== PERMISSIONS ====================
  console.log("\n--- Seeding permissions ---");
  const permMap: Record<string, number> = {};
  for (const entry of permEntries) {
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

  // ==================== ROLE_PERMISSIONS ====================
  console.log("\n--- Assigning permissions to roles ---");
  for (const [roleName, permNames] of Object.entries(rolePermAssignments)) {
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

      // Check if already assigned (non-deleted)
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

      // Check soft-deleted assignment
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

  // ==================== TEST USERS ====================
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
    // Check if user already exists
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    if (existingUser) {
      console.log(`⏭️  User '${email}' already exists`);
      continue;
    }

    // Create user via better-auth signUpEmail endpoint
    const user = await auth.api.signUpEmail({
      body: { email, password, name },
    });

    const userId = ("id" in user ? user.id : user.user.id) as string;
    console.log(`✅ Created user: ${email} (id=${userId})`);

    // Now set roleId via Drizzle update — signUpEmail cannot set additionalFields
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

// Only run if executed directly (not imported)
seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
