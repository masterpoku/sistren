import { and, eq, isNull } from "drizzle-orm";
import { db } from "./index";
import { permissions, roles } from "./schema";

console.log("🌱 Starting permission seed...");

export async function seedPermissions() {
  // ==================== PERMISSIONS ====================
  // Permissions follow {resource}.{action} convention: parse from name
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
      name: "grades.read",
      description: "Read grades",
      resource: "grades",
      action: "read",
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

  for (const entry of permEntries) {
    const [existing] = await db
      .select({ id: permissions.id })
      .from(permissions)
      .where(
        and(eq(permissions.name, entry.name), isNull(permissions.deletedAt))
      )
      .limit(1);

    if (existing) {
      console.log(`⏭️  Permission '${entry.name}' already exists, skipping`);
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
        console.log(`♻️  Permission '${entry.name}' restored from soft-delete`);
      } else {
        await db.insert(permissions).values({ ...entry, deletedAt: null });
        console.log(`✅ Seeded permission: ${entry.name}`);
      }
    }
  }

  // ==================== ROLE_PERMISSIONS ====================
  // Get all roles and permissions (active only)
  const allRoles = await db.select().from(roles).where(isNull(roles.deletedAt));
  const allPerms = await db
    .select()
    .from(permissions)
    .where(isNull(permissions.deletedAt));

  if (allRoles.length === 0 || allPerms.length === 0) {
    console.log("⚠️  No roles or permissions found. Run base seed first.");
    return;
  }

  const roleMap = Object.fromEntries(allRoles.map((r) => [r.name, r]));
  const permMap = Object.fromEntries(allPerms.map((p) => [p.name, p]));

  // Administrator permissions
  const adminPermNames = [
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
  ];

  // Guru permissions
  const guruPermNames = [
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
  ];

  // Siswa permissions
  const siswaPermNames = [
    "grades.read_own",
    "announcements.read",
    "profile.edit_own",
    "students.read",
    "payments.read_own",
    "enrollments.read",
  ];

  // Alumni permissions
  const alumniPermNames = ["grades.read_own", "profile.edit_own"];

  const assignments = [
    { roleName: "superadmin", perms: allPerms.map((p) => p.name) },
    { roleName: "administrator", perms: adminPermNames },
    { roleName: "guru", perms: guruPermNames },
    { roleName: "siswa", perms: siswaPermNames },
    { roleName: "alumni", perms: alumniPermNames },
  ];

  for (const { roleName, perms } of assignments) {
    if (!roleMap[roleName]) {
      console.log(`⏭️  Role '${roleName}' not found, skipping`);
      continue;
    }

    for (const permName of perms) {
      if (!permMap[permName]) {
        console.log(`⏭️  Permission '${permName}' not found, skipping`);
        continue;
      }

      try {
        await db.execute(
          `INSERT INTO role_permissions (role_id, permission_id)
           SELECT ${roleMap[roleName].id}, ${permMap[permName].id}
           FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = ${roleMap[roleName].id} AND permission_id = ${permMap[permName].id})`
        );
      } catch (e: any) {
        console.error(
          `Failed to assign permission '${permName}' to role '${roleName}':`,
          e.message
        );
      }
    }
    console.log(`✅ Seeded ${roleName} permissions`);
  }

  console.log("🎉 Permission seed completed");
}
