import { getSemesters } from "@/actions/academic";
import { SemesterFormCard } from "@/features/academic/SemesterFormCard";
import { SemestersClient } from "@/features/academic/semesters/SemestersClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function SemestersPage() {
  await verifyRoleLevel(60);
  const semesterList = await getSemesters();

  return (
    <>
      <SemesterFormCard />
      <SemestersClient data={semesterList} />
    </>
  );
}
