import { and, eq, isNull } from "drizzle-orm";
import { PageShell } from "@/components/ui/page-shell";
import { ApprovalsClient } from "@/features/admin/ApprovalsClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { profiles, users } from "@/lib/db/schema";

async function getPendingStudents() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      nisn: profiles.nisn,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(eq(users.emailVerified, false), isNull(users.deletedAt)));
}

export default async function ApprovalsPage() {
  await verifyRoleLevel(80);
  const pendingStudents = await getPendingStudents();
  return (
    <PageShell
      title="Approval Siswa"
      description="Daftar siswa yang menunggu verifikasi akun."
    >
      <ApprovalsClient data={pendingStudents} />
    </PageShell>
  );
}
