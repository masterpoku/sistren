import { getEnrollments, getAvailableStudents, createEnrollment } from '@/actions/enrollments'
import { getSemesters } from '@/actions/academic'
import { getClasses } from '@/actions/academic'
import { verifyRoleLevel } from '@/lib/auth/verify-session'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function EnrollmentsPage() {
  await verifyRoleLevel(60)

  const [enrollmentList, studentList, semesterList, classList] = await Promise.all([
    getEnrollments(),
    getAvailableStudents(),
    getSemesters(),
    getClasses(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pendaftaran Siswa</h1>
        <p className="text-muted-foreground">Kelola pendaftaran siswa per semester.</p>
      </div>

      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle>Tambah Pendaftaran</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={async (formData: FormData) => {
            'use server'
            const result = await createEnrollment(formData)
            if (result && 'error' in result) {
              throw new Error(result.error)
            }
          }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">Siswa</Label>
              <Select name="studentId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih siswa" />
                </SelectTrigger>
                <SelectContent>
                  {studentList.map((s: { id: string; name: string }) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="semesterId">Semester</Label>
              <Select name="semesterId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesterList.map((s: { id: number; name: string; academicYear: string }) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.academicYear})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="classId">Kelas</Label>
              <Select name="classId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {classList.map((c: { id: number; name: string }) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button type="submit" className="w-full">Daftarkan</Button>
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
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollmentList.map((e: { id: number; studentName: string; studentEmail: string; className: string; semesterName: string; academicYear: string }) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">{e.studentName}</TableCell>
                <TableCell className="text-muted-foreground">{e.studentEmail}</TableCell>
                <TableCell>{e.className}</TableCell>
                <TableCell>{e.semesterName} ({e.academicYear})</TableCell>
                <TableCell>
                  <form action={async () => {
                    'use server'
                    const { deleteEnrollment } = await import('@/actions/enrollments')
                    await deleteEnrollment(String(e.id))
                  }}>
                    <Button size="sm" variant="destructive" type="submit">Hapus</Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}