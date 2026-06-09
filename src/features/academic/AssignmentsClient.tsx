"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { assignTeacher, removeAssignment } from "@/actions/academic";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Assignment = {
  id: number;
  teacherName: string;
  className: string;
  subjectName: string;
  semesterName: string;
  academicYear: string;
};

type Teacher = { id: string; name: string };
type Class = { id: number; name: string };
type Subject = { id: number; name: string };
type Semester = { id: number; name: string; academicYear: string };

interface AssignmentsClientProps {
  assignments: Assignment[];
  teachers: Teacher[];
  classes: Class[];
  subjects: Subject[];
  semesters: Semester[];
}

export function AssignmentsClient({
  assignments,
  teachers,
  classes,
  subjects,
  semesters,
}: AssignmentsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleAssign(formData: FormData) {
    startTransition(async () => {
      const result = await assignTeacher(formData);
      if (result && "error" in result) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  }

  function handleRemove(id: number) {
    startTransition(async () => {
      await removeAssignment(String(id));
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tugas Guru</h1>
          <p className="text-muted-foreground">
            Tugaskan guru ke kelas dan mata pelajaran per semester.
          </p>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-4">Tambah Tugas Baru</h2>
        <form
          action={handleAssign}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <div className="space-y-1">
            <Label htmlFor="teacherId">Guru</Label>
            <Select name="teacherId" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih guru" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="classId">Kelas</Label>
            <Select name="classId" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="subjectId">Mapel</Label>
            <Select name="subjectId" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih mapel" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="semesterId">Semester</Label>
            <Select name="semesterId" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name} ({s.academicYear})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Tambah"}
            </Button>
          </div>
        </form>
      </div>

      {assignments.length === 0 ? (
        <p className="text-muted-foreground">Belum ada tugas.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guru</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Mapel</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.teacherName}</TableCell>
                <TableCell>{a.className}</TableCell>
                <TableCell>{a.subjectName}</TableCell>
                <TableCell>
                  {a.semesterName} ({a.academicYear})
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemove(a.id)}
                    disabled={isPending}
                  >
                    Hapus
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
