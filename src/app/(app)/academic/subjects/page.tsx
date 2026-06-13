import { getClasses, getSubjects } from "@/actions/academic";
import { PageShell } from "@/components/ui/page-shell";
import { SubjectFormCard } from "@/features/academic/subjects/SubjectFormCard";
import { SubjectsClient } from "@/features/academic/subjects/SubjectsClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function SubjectsPage() {
  await verifyRoleLevel(60);
  const [subjectList, classList] = await Promise.all([
    getSubjects(),
    getClasses(),
  ]);

  return (
    <PageShell
      title="Kelola Mata Pelajaran"
      description="Tambah dan kelola mata pelajaran per kelas."
    >
      <SubjectFormCard classList={classList} />

      <div className="rounded-md border">
        <SubjectsClient data={subjectList} />
      </div>
    </PageShell>
  );
}
