import { getClasses, deleteClass } from '@/actions/academic';
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

export default async function ClassesPage() {
  await verifyRoleLevel(60);
  const classList = await getClasses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola Kelas</h1>
          <p className="text-muted-foreground">
            Tambah dan kelola kelas (X, XI, XII).
          </p>
        </div>
      </div>

      {classList.length === 0 ? (
        <p className="text-muted-foreground">Belum ada kelas.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Kode</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classList.map((kelas) => (
              <TableRow key={kelas.id}>
                <TableCell className="font-medium">{kelas.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{kelas.code}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <form
                      action={async () => {
                        'use server';
                        await deleteClass(String(kelas.id));
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
