"use server";

import { revalidatePath } from "next/cache";
import { getClasses, getSemesters } from "@/actions/academic";
import {
  createEnrollment,
  getAvailableStudents,
  getEnrollments,
} from "@/actions/enrollments";
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
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function EnrollmentsPage() {
  await verifyRoleLevel(60);

  const [enrollmentList, studentList, semesterList, classList] =
    await Promise.all([
      getEnrollments(),
      getAvailableStudents(),
      getSemesters(),
      getClasses(),
    ]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pendaftaran Siswa</h1>
        <p className="text-muted-foreground">
          Kelola pendaftaran siswa per semester.
        </p>
      </div>

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
            action={async (formData: FormData) => {
              "use server";
              const result = await createEnrollment(formData);
              if (result && "error" in result) {
                throw new Error(result.error);
              }
              revalidatePath("/enrollments");
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="space-y-2">
              <Label>Siswa</Label>
              <Select name="studentId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih siswa" />
                </SelectTrigger>
                <SelectContent>
                  {studentList.map((s: { id: string; name: string }) => (
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
                  {semesterList.map(
                    (s: { id: number; name: string; academicYear: string }) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name} ({s.academicYear})
                      </SelectItem>
                    )
                  )}
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
                  {classList.map((c: { id: number; name: string }) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button type="submit" className="w-full">
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
            {enrollmentList.map(
              (e: {
                id: number;
                studentName: string;
                studentEmail: string;
                className: string;
                semesterName: string;
                academicYear: string;
                status: string;
              }) => (
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
                      <form
                        action={async () => {
                          "use server";
                          const { deleteEnrollment } = await import(
                            "@/actions/enrollments"
                          );
                          await deleteEnrollment(String(e.id));
                          revalidatePath("/enrollments");
                        }}
                      >
                        <Button size="sm" variant="destructive" type="submit">
                          Hapus
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
