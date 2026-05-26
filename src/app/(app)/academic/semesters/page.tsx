import {
  getSemesters,
  setActiveSemester,
  deleteSemester,
} from '@/actions/academic';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { verifyRoleLevel } from '@/lib/auth/verify-session';
import { Badge } from '@/components/ui/badge';

export default async function SemestersPage() {
  await verifyRoleLevel(60);
  const semesterList = await getSemesters();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola Semester</h1>
          <p className="text-muted-foreground">
            Atur semester dan tahun ajaran.
          </p>
        </div>
      </div>

      {semesterList.length === 0 ? (
        <p className="text-muted-foreground">Belum ada semester.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Tahun Ajaran</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {semesterList.map((semester) => (
              <TableRow key={semester.id}>
                <TableCell className="font-medium">{semester.name}</TableCell>
                <TableCell>{semester.academicYear}</TableCell>
                <TableCell>
                  {semester.isActive ? (
                    <Badge className="bg-green-500">Aktif</Badge>
                  ) : (
                    <Badge variant="outline">Tidak Aktif</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {!semester.isActive && (
                      <form
                        action={async () => {
                          'use server';
                          await setActiveSemester(String(semester.id));
                        }}
                      >
                        <Button size="sm" variant="outline" type="submit">
                          Aktifkan
                        </Button>
                      </form>
                    )}
                    <form
                      action={async () => {
                        'use server';
                        await deleteSemester(String(semester.id));
                      }}
                    >
                      <Button size="sm" variant="destructive" type="submit">
                        Hapus
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
