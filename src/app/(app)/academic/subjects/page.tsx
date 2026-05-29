import { getSubjects, createSubjectAction, getClasses } from '@/actions/academic';
import { verifyRoleLevel } from '@/lib/auth/verify-session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SubjectsClient } from '@/features/academic/subjects/SubjectsClient';

export default async function SubjectsPage() {
  await verifyRoleLevel(60);
  const [subjectList, classList] = await Promise.all([
    getSubjects(),
    getClasses(),
  ]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Mata Pelajaran</h1>
          <p className="text-muted-foreground">
            Tambah dan kelola mata pelajaran per kelas.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Mata Pelajaran</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createSubjectAction} className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Mapel</Label>
              <Input id="name" name="name" placeholder="Nama mata pelajaran" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Kode</Label>
              <Input id="code" name="code" placeholder="Opsional" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classId">Kelas</Label>
              <select
                id="classId"
                name="classId"
                required
                className="flex h-8 w-[180px] rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
              >
                <option value="">Pilih kelas...</option>
                {classList.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name} ({cls.code})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="credits">SKS</Label>
              <Input id="credits" name="credits" type="number" min="0" defaultValue="0" className="w-20" />
            </div>
            <Button type="submit">Tambah</Button>
          </form>
        </CardContent>
      </Card>

      <SubjectsClient data={subjectList} />
    </div>
  );
}
