import { getClasses, getSubjects } from "@/actions/academic";
import { PageShell } from "@/components/ui/page-shell";
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
      <SubjectsClient data={subjectList} classList={classList} />
    </PageShell>
  );
}
