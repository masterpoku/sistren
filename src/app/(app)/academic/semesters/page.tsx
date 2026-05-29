import { getSemesters, createSemesterAction } from '@/actions/academic';
import { verifyRoleLevel } from '@/lib/auth/verify-session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SemestersClient } from '@/features/academic/semesters/SemestersClient';

export default async function SemestersPage() {
  await verifyRoleLevel(60);
  const semesterList = await getSemesters();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Semester</h1>
          <p className="text-muted-foreground">
            Atur semester dan tahun ajaran.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Semester</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createSemesterAction} className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Semester</Label>
              <Input id="name" name="name" placeholder="Contoh: Semester 1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="academicYear">Tahun Ajaran</Label>
              <Input id="academicYear" name="academicYear" placeholder="Contoh: 2025/2026" required />
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Checkbox id="isActive" name="isActive" value="true" />
              <Label htmlFor="isActive">Semester Aktif</Label>
            </div>
            <Button type="submit">Tambah</Button>
          </form>
        </CardContent>
      </Card>

      <SemestersClient data={semesterList} />
    </div>
  );
}
