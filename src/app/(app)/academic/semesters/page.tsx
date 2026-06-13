import { getSemesters } from "@/actions/academic";
import { PageShell } from "@/components/ui/page-shell";
import { SemesterFormCard } from "@/features/academic/SemesterFormCard";
import { SemestersClient } from "@/features/academic/semesters/SemestersClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function SemestersPage() {
  await verifyRoleLevel(60);
  const semesterList = await getSemesters();

  return (
    <PageShell
      title="Kelola Semester"
      description="Tambah dan kelola semester serta tahun ajaran."
    >
      <SemesterFormCard />

      <div className="rounded-md border">
        <SemestersClient data={semesterList} />
      </div>
    </PageShell>
  );
}
