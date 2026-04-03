import { MOCK_ACADEMIC_RECORDS, MOCK_COURSES } from '@/util/mock/academic';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AcademicPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Akademik</h1>
        <p className="text-muted-foreground">Data akademik dan nilai siswa</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">IPK Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {MOCK_ACADEMIC_RECORDS[MOCK_ACADEMIC_RECORDS.length - 1].gpa}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total SKS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {MOCK_ACADEMIC_RECORDS.reduce((sum, r) => sum + r.credits, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Mata Kuliah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_COURSES.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rekam Akademik</CardTitle>
            <CardDescription>IP per semester</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_ACADEMIC_RECORDS.map((record) => (
                <div
                  key={record.semester}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <span className="font-medium">{record.semester}</span>
                  <div className="text-right">
                    <span className="text-lg font-bold">{record.gpa}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({record.credits} SKS)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mata Kuliah</CardTitle>
            <CardDescription>Kartu hasil studi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left text-sm font-medium">Kode</th>
                    <th className="pb-2 text-left text-sm font-medium">
                      Mata Kuliah
                    </th>
                    <th className="pb-2 text-left text-sm font-medium">SKS</th>
                    <th className="pb-2 text-left text-sm font-medium">
                      Nilai
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_COURSES.map((course) => (
                    <tr key={course.id} className="border-b">
                      <td className="py-2">{course.id}</td>
                      <td className="py-2">{course.name}</td>
                      <td className="py-2">{course.credits}</td>
                      <td className="py-2">
                        <span className="font-medium">{course.grade}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
