import { and, desc, eq, isNull } from "drizzle-orm";
import { StudentsClient } from "@/features/students/StudentsClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { profiles, roles, users } from "@/lib/db/schema";

async function getStudents() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      nisn: profiles.nisn,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(eq(roles.level, 40), isNull(users.deletedAt)))
    .orderBy(desc(users.createdAt));
}

export default async function StudentsPage() {
  await verifyRoleLevel(60);
  const studentList = await getStudents();
  return <StudentsClient data={studentList} />;
}
