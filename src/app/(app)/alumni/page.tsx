import { and, desc, eq, isNull } from "drizzle-orm";
import { verifyRoleLevel } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { enrollments, profiles, roles, users } from "@/lib/db/schema";
import { AlumniClient } from "@/features/alumni/AlumniClient";

async function getAlumni() {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      nisn: profiles.nisn,
      enrollmentStatus: enrollments.status,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .leftJoin(
      enrollments,
      and(
        eq(users.id, enrollments.studentId),
        eq(enrollments.status, "graduated"),
        isNull(enrollments.deletedAt)
      )
    )
    .where(and(eq(roles.level, 20), isNull(users.deletedAt)))
    .orderBy(desc(users.createdAt));

  return rows;
}

export default async function AlumniPage() {
  await verifyRoleLevel(60);
  const data = await getAlumni();
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alumni</h1>
        <p className="text-muted-foreground">
          Daftar siswa yang sudah lulus
        </p>
      </div>
      <AlumniClient data={data} />
    </div>
  );
}
