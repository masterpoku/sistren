import { db } from '@/lib/db';
import { users, roles } from '@/lib/db/schema';
import { eq, isNull, and, desc } from 'drizzle-orm';
import { verifyRoleLevel } from '@/lib/auth/verify-session';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Guru</h1>
        <p className="text-muted-foreground">Daftar guru ter-register.</p>
      </div>

      {teacherList.length === 0 ? (
        <p className="text-muted-foreground">Belum ada guru.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teacherList.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell className="font-medium">{teacher.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {teacher.email}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {teacher.roleName ?? 'guru'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
