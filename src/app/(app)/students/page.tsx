import { db } from '@/lib/db';
import { users, profiles, roles } from '@/lib/db/schema';
import { eq, isNull, and, desc } from 'drizzle-orm';
import { verifyRoleLevel } from '@/lib/auth/verify-session';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

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

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Siswa</h1>
        <p className="text-muted-foreground">Daftar siswa ter-register.</p>
      </div>

      {studentList.length === 0 ? (
        <p className="text-muted-foreground">Belum ada siswa.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>NISN</TableHead>
              <TableHead>Dokumen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentList.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {student.email}
                </TableCell>
                <TableCell>{student.nisn ?? '-'}</TableCell>
                <TableCell>
                  <Link href={`/students/${student.id}/documents`}>
                    <Button size="sm" variant="outline">
                      Dokumen
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
