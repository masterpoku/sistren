"use client";

import { createSemesterAction } from "@/actions/academic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SemesterFormCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Semester</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={createSemesterAction}
          className="flex flex-wrap items-end gap-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nama Semester</Label>
            <Input
              id="name"
              name="name"
              placeholder="Contoh: Semester 1"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="academicYear">Tahun Ajaran</Label>
            <Input
              id="academicYear"
              name="academicYear"
              placeholder="Contoh: 2025/2026"
              required
            />
          </div>
          <div className="flex items-center gap-2 pb-1">
            <Checkbox id="isActive" name="isActive" value="true" />
            <Label htmlFor="isActive">Semester Aktif</Label>
          </div>
          <a
            href="/academic/semesters"
            className="inline-flex h-9 px-4 items-center justify-center rounded-md border border-input bg-background text-sm font-medium hover:bg-muted"
          >
            Batal
          </a>
          <Button type="submit">Tambah</Button>
        </form>
      </CardContent>
    </Card>
  );
}
