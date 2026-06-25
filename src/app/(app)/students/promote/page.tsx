import { getClasses, getSemesters } from "@/actions/academic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";
import { PromoteClassDialog } from "@/features/students/PromoteClassDialog";
import { TransferStudentDialog } from "@/features/students/TransferStudentDialog";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function PromotePage() {
  await verifyRoleLevel(80);
  const [classList, semesterList] = await Promise.all([
    getClasses(),
    getSemesters(),
  ]);

  const studentList = [
    { id: "placeholder", name: "Siswa (gunakan halaman Siswa)" },
  ];

  return (
    <PageShell
      title="Pindah Kelas / Naik Kelas"
      description="Kelola perpindahan siswa antar kelas dan kenaikan kelas."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pindah Kelas</CardTitle>
            <CardDescription>
              Pindahkan siswa individual ke kelas lain pada semester aktif.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransferStudentDialog
              students={studentList}
              semesters={semesterList}
              classes={classList}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Naik Kelas</CardTitle>
            <CardDescription>
              Buat enrollment baru di semester tujuan untuk seluruh siswa aktif.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PromoteClassDialog classes={classList} semesters={semesterList} />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
