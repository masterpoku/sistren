import { getMajors, deleteMajor } from '@/actions/academic';
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

export default async function MajorsPage() {
  await verifyRoleLevel(60);
  const majorList = await getMajors();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola Jurusan</h1>
          <p className="text-muted-foreground">
            Tambah dan kelola jurusan/program keahlian.
          </p>
        </div>
      </div>

      {majorList.length === 0 ? (
        <p className="text-muted-foreground">Belum ada jurusan.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {majorList.map((major) => (
              <TableRow key={major.id}>
                <TableCell className="font-medium">{major.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {major.description ?? '-'}
                </TableCell>
                <TableCell>
                  <form
                    action={async () => {
                      'use server';
                      await deleteMajor(String(major.id));
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
