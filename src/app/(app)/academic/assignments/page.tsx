import {
  getAssignments,
  getTeachers,
  assignTeacher,
  removeAssignment,
  getClasses,
  getSubjects,
  getSemesters,
} from '@/actions/academic';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { verifyRoleLevel } from '@/lib/auth/verify-session';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default async function AssignmentsPage() {
  await verifyRoleLevel(60);
  const [assignmentList, classList, subjectList, semesterList, teacherList] =
    await Promise.all([
      getAssignments(),
      getClasses(),
      getSubjects(),
      getSemesters(),
      getTeachers(),
    ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tugas Guru</h1>
          <p className="text-muted-foreground">
            Tugaskan guru ke kelas dan mata pelajaran per semester.
          </p>
        </div>
      </div>

      {/* Assign Form - admin only */}
      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-4">Tambah Tugas Baru</h2>
        <form
          action={async (formData: FormData) => {
            'use server';
            const result = await assignTeacher(formData);
            if (result && 'error' in result) {
              throw new Error(result.error);
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <div className="space-y-1">
            <Label htmlFor="teacherId">Guru</Label>
            <Select name="teacherId" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih guru" />
              </SelectTrigger>
              <SelectContent>
                {teacherList.map((t: { id: string; name: string }) => (
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
                {classList.map((c: { id: number; name: string }) => (
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
                {subjectList.map((s: { id: number; name: string }) => (
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
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Tambah
            </Button>
          </div>
        </form>
      </div>

      {/* Assignment List */}
      {assignmentList.length === 0 ? (
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
            {assignmentList.map(
              (a: {
                id: number;
                teacherName: string;
                className: string;
                subjectName: string;
                semesterName: string;
                academicYear: string;
              }) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.teacherName}</TableCell>
                  <TableCell>{a.className}</TableCell>
                  <TableCell>{a.subjectName}</TableCell>
                  <TableCell>
                    {a.semesterName} ({a.academicYear})
                  </TableCell>
                  <TableCell>
                    <form
                      action={async () => {
                        'use server';
                        await removeAssignment(String(a.id));
                      }}
                    >
                      <Button size="sm" variant="destructive" type="submit">
                        Hapus
                      </Button>
                    </form>
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
