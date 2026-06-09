import { getSemesters } from "@/actions/academic";
import { SemesterFormCard } from "@/features/academic/SemesterFormCard";
import { SemestersClient } from "@/features/academic/semesters/SemestersClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function SemestersPage() {
  await verifyRoleLevel(60);
  const semesterList = await getSemesters();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Semester</h1>
          <p className="text-muted-foreground">
            Atur semester dan tahun ajaran.
          </p>
        </div>
      </div>

      <SemesterFormCard />
      <div className="rounded-md border bg-card">
        <SemestersClient data={semesterList} />
      </div>
    </div>
  );
}
