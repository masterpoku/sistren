"use client";

import { useState, useTransition } from "react";
import { createEnrollment, deleteEnrollment } from "@/actions/enrollments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { BulkEnrollmentForm } from "@/features/enrollments/BulkEnrollmentForm";
import { EnrollmentStatusBadge } from "@/features/enrollments/EnrollmentStatusBadge";
import { StatusChangeForm } from "@/features/enrollments/StatusChangeForm";

interface Enrollment {
  id: number;
  studentName: string;
  studentEmail: string;
  className: string;
  semesterName: string;
  academicYear: string;
  status: string;
}

interface EnrollmentsClientProps {
  enrollmentList: Enrollment[];
  studentList: { id: string; name: string }[];
  semesterList: { id: number; name: string; academicYear: string }[];
  classList: { id: number; name: string }[];
}

export function EnrollmentsClient({
  enrollmentList,
  studentList,
  semesterList,
  classList,
}: EnrollmentsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCreateEnrollment(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createEnrollment(formData);
      if (result && "error" in result && result.error) {
        setError(result.error);
      }
    });
  }

  function handleDeleteEnrollment(enrollmentId: number) {
    setError(null);
    startTransition(async () => {
      await deleteEnrollment(String(enrollmentId));
    });
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Bulk Enrollment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Enrollment</CardTitle>
        </CardHeader>
        <CardContent>
          <BulkEnrollmentForm
            classList={classList}
            semesterList={semesterList}
          />
        </CardContent>
      </Card>

      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle>Tambah Pendaftaran</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={handleCreateEnrollment}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="space-y-2">
              <Label>Siswa</Label>
              <Select name="studentId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih siswa" />
                </SelectTrigger>
                <SelectContent>
                  {studentList.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Semester</Label>
              <Select name="semesterId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesterList.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name} ({s.academicYear})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kelas</Label>
              <Select name="classId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {classList.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={isPending}>
                Daftarkan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Enrollment List */}
      {enrollmentList.length === 0 ? (
        <p className="text-muted-foreground">Belum ada pendaftaran.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Siswa</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollmentList.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">{e.studentName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {e.studentEmail}
                </TableCell>
                <TableCell>{e.className}</TableCell>
                <TableCell>
                  {e.semesterName} ({e.academicYear})
                </TableCell>
                <TableCell>
                  <EnrollmentStatusBadge status={e.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {e.status === "active" ? (
                      <StatusChangeForm enrollmentId={e.id} />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Tidak dapat diubah
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isPending}
                      onClick={() => handleDeleteEnrollment(e.id)}
                    >
                      Hapus
                    </Button>
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
