import { notFound } from "next/navigation";
import { getGraduationData } from "@/actions/promotion";
import { verifyRoleLevel } from "@/lib/auth/verify-session";
import { NilaiForm } from "./nilai-form";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ semesterId?: string }>;
}

export default async function GraduatePage({ params, searchParams }: Props) {
  await verifyRoleLevel(80);

  const { id } = await params;
  const { semesterId } = await searchParams;

  if (!semesterId) {
    notFound();
  }

  const result = await getGraduationData(id, Number(semesterId));

  if ("error" in result) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20">
        <p className="text-destructive text-lg font-medium">Error</p>
        <p className="text-muted-foreground">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Isi Nilai</h1>
        <p className="text-muted-foreground">
          {result.student.name} · {result.student.email}
        </p>
        <p className="text-sm text-muted-foreground">
          Kelas: {result.enrollment.className} ({result.enrollment.classCode})
          · {result.enrollment.semesterName} ({result.enrollment.academicYear})
        </p>
      </div>

      <NilaiForm
        studentId={id}
        semesterId={Number(semesterId)}
        classId={result.enrollment.classId}
        subjects={result.subjects}
        classes={result.classes}
        semesters={result.semesters}
      />
    </div>
  );
}
