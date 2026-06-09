import { and, desc, eq, isNull } from "drizzle-orm";
import { TeachersClient } from "@/features/teachers/TeachersClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { roles, users } from "@/lib/db/schema";

async function getTeachers() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      roleName: roles.name,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(and(eq(roles.level, 60), isNull(users.deletedAt)))
    .orderBy(desc(users.createdAt));
}

export default async function TeachersPage() {
  await verifyRoleLevel(60);
  const teacherList = await getTeachers();
  return <TeachersClient data={teacherList} />;
}
