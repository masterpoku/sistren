import { and, desc, eq, isNull, notInArray } from "drizzle-orm";
import { PageShell } from "@/components/ui/page-shell";
import { AdminUsersClient } from "@/features/admin/AdminUsersClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { enrollments, roles, users } from "@/lib/db/schema";

async function getUsers() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      roleId: users.roleId,
      roleName: roles.name,
      roleLevel: roles.level,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(isNull(users.deletedAt))
    .orderBy(desc(users.createdAt));
}

async function getStudentEnrollments() {
  const rows = await db
    .select({
      studentId: enrollments.studentId,
      semesterId: enrollments.semesterId,
      enrollmentId: enrollments.id,
    })
    .from(enrollments)
    .where(
      and(eq(enrollments.status, "active"), isNull(enrollments.deletedAt))
    );
  const map = new Map<string, { semesterId: number; enrollmentId: number }>();
  for (const r of rows) {
    if (!map.has(r.studentId)) {
      map.set(r.studentId, {
        semesterId: r.semesterId,
        enrollmentId: r.enrollmentId,
      });
    }
  }
  return map;
}

async function getEditableRoles() {
  return db
    .select({ id: roles.id, name: roles.name })
    .from(roles)
    .where(
      and(
        isNull(roles.deletedAt),
        notInArray(roles.name, ["superadmin", "administrator"])
      )
    );
}

export default async function AdminUsersPage() {
  await verifyRoleLevel(80);
  const [userList, roleList, enrollmentMap] = await Promise.all([
    getUsers(),
    getEditableRoles(),
    getStudentEnrollments(),
  ]);
  const enriched = userList.map((u) => {
    const e = enrollmentMap.get(u.id);
    return {
      ...u,
      enrollmentId: e?.enrollmentId ?? null,
      semesterId: e?.semesterId ?? null,
    };
  });
  return (
    <PageShell
      title="Manajemen Pengguna"
      description="Kelola akun staff, role, dan approval."
    >
      <AdminUsersClient data={enriched} roles={roleList} />
    </PageShell>
  );
}
