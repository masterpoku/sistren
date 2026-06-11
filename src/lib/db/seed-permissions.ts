import { and, eq, isNull } from "drizzle-orm";
import { db } from "./index";
import { PERMISSIONS, ROLE_PERMISSIONS } from "./permissions";
import { permissions, rolePermissions, roles } from "./schema";

console.log("🌱 Starting permission seed...");

export async function seedPermissions() {
  for (const entry of PERMISSIONS) {
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

  const assignments = [
    { roleName: "superadmin", perms: allPerms.map((p) => p.name) },
    { roleName: "administrator", perms: ROLE_PERMISSIONS.administrator },
    { roleName: "guru", perms: ROLE_PERMISSIONS.guru },
    { roleName: "siswa", perms: ROLE_PERMISSIONS.siswa },
    { roleName: "alumni", perms: ROLE_PERMISSIONS.alumni },
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
        const existing = await db.query.rolePermissions.findFirst({
          where: (rp, { and }) =>
            and(
              eq(rp.roleId, roleMap[roleName].id),
              eq(rp.permissionId, permMap[permName].id)
            ),
        });

        if (!existing) {
          await db.insert(rolePermissions).values({
            roleId: roleMap[roleName].id,
            permissionId: permMap[permName].id,
          });
        }
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
