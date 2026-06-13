"use client";

import { createSubjectAction } from "@/actions/academic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ClassItem = { id: number; name: string; code: string };

interface SubjectFormCardProps {
  classList: ClassItem[];
}

export function SubjectFormCard({ classList }: SubjectFormCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Mata Pelajaran</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={createSubjectAction}
          className="flex flex-wrap items-end gap-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nama Mapel</Label>
            <Input
              id="name"
              name="name"
              placeholder="Nama mata pelajaran"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Kode</Label>
            <Input id="code" name="code" placeholder="Opsional" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="classId">Kelas</Label>
            <Select name="classId" required>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Pilih kelas..." />
              </SelectTrigger>
              <SelectContent>
                {classList.map((cls) => (
                  <SelectItem key={cls.id} value={String(cls.id)}>
                    {cls.name} ({cls.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="credits">SKS</Label>
            <Input
              id="credits"
              name="credits"
              type="number"
              min="0"
              defaultValue="0"
              className="w-20"
            />
          </div>
          <Button type="reset" variant="outline">
            Batal
          </Button>
          <Button type="submit">Tambah</Button>
        </form>
      </CardContent>
    </Card>
  );
}
