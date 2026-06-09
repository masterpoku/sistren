import { createClassAction, getClasses } from "@/actions/academic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { columns } from "@/features/academic/classes/ClassesClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function ClassesPage() {
  await verifyRoleLevel(60);
  const classList = await getClasses();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Kelas</h1>
          <p className="text-muted-foreground">
            Tambah dan kelola kelas (X, XI, XII).
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Kelas</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createClassAction} className="flex items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kelas</Label>
              <Input
                id="name"
                name="name"
                placeholder="Contoh: X, XI, XII"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Kode</Label>
              <Input
                id="code"
                name="code"
                placeholder="Contoh: X-1, XI-2"
                required
              />
            </div>
            <a
              href="/academic/classes"
              className="inline-flex h-9 px-4 items-center justify-center rounded-md border border-input bg-background text-sm font-medium hover:bg-muted"
            >
              Batal
            </a>
            <Button type="submit">Tambah</Button>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-card">
        <DataTable
          columns={columns}
          data={classList}
          searchKey="name"
          exportFilename="kelas"
        />
      </div>
    </div>
  );
}
