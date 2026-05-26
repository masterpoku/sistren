import { db } from '@/lib/db';
import { users, profiles } from '@/lib/db/schema';
import { eq, isNull, and } from 'drizzle-orm';
import { verifyRoleLevel } from '@/lib/auth/verify-session';
import { approveStudent, rejectStudent } from '@/actions/admin';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
  await verifyRoleLevel(80); // admin only

  const pendingStudents = await getPendingStudents();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Persetujuan Pendaftaran</h1>
        <p className="text-muted-foreground">
          Lihat dan setujui siswa yang menunggu aktivasi akun.
        </p>
      </div>

      {pendingStudents.length === 0 ? (
        <p className="text-muted-foreground">
          Tidak ada siswa yang menunggu persetujuan.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>NISN</TableHead>
              <TableHead>Tanggal Daftar</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.nisn || '-'}</TableCell>
                <TableCell>
                  {student.createdAt?.toLocaleDateString('id-ID')}
                </TableCell>
                <TableCell className="flex gap-2">
                  <form
                    action={async () => {
                      'use server';
                      await approveStudent(student.id);
                    }}
                  >
                    <Button size="sm" variant="default">
                      Setujui
                    </Button>
                  </form>
                  <form
                    action={async () => {
                      'use server';
                      await rejectStudent(student.id);
                    }}
                  >
                    <Button size="sm" variant="destructive">
                      Tolak
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
