import { getSubjects, deleteSubject } from '@/actions/academic';
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

export default async function SubjectsPage() {
  await verifyRoleLevel(60);
  const subjectList = await getSubjects();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola Mata Pelajaran</h1>
          <p className="text-muted-foreground">
            Tambah dan kelola mata pelajaran per kelas.
          </p>
        </div>
      </div>

      {subjectList.length === 0 ? (
        <p className="text-muted-foreground">Belum ada mata pelajaran.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Kode</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>SKS</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjectList.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell>{subject.code ?? '-'}</TableCell>
                <TableCell>{subject.className ?? '-'}</TableCell>
                <TableCell>{subject.credits ?? 0}</TableCell>
                <TableCell>
                  <form
                    action={async () => {
                      'use server';
                      await deleteSubject(String(subject.id));
                    }}
                  >
                    <Button size="sm" variant="destructive" type="submit">
                      Hapus
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
