import { createMajorAction, getMajors } from "@/actions/academic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/ui/page-shell";
import { MajorsClient } from "@/features/academic/majors/MajorsClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function MajorsPage() {
  await verifyRoleLevel(60);
  const majorList = await getMajors();

  return (
    <PageShell
      title="Kelola Jurusan"
      description="Tambah dan kelola jurusan/program keahlian."
    >
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
            <Button type="reset" variant="outline">
              Batal
            </Button>
            <Button type="submit">Tambah</Button>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <MajorsClient data={majorList} />
      </div>
    </PageShell>
  );
}
