import { getMajors, createMajorAction } from '@/actions/academic';
import { verifyRoleLevel } from '@/lib/auth/verify-session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MajorsClient } from '@/features/academic/majors/MajorsClient';

export default async function MajorsPage() {
  await verifyRoleLevel(60);
  const majorList = await getMajors();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Jurusan</h1>
          <p className="text-muted-foreground">
            Tambah dan kelola jurusan/program keahlian.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Jurusan</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createMajorAction} className="flex items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Jurusan</Label>
              <Input
                id="name"
                name="name"
                placeholder="Contoh: Teknik Komputer dan Jaringan"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Input
                id="description"
                name="description"
                placeholder="Opsional"
              />
            </div>
            <a
              href="/academic/majors"
              className="inline-flex h-9 px-4 items-center justify-center rounded-md border border-input bg-background text-sm font-medium hover:bg-muted"
            >
              Batal
            </a>
            <Button type="submit">Tambah</Button>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-card">
        <MajorsClient data={majorList} />
      </div>
    </div>
  );
}