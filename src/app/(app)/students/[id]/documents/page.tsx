import { getDocuments } from "@/actions/documents";
import { PageShell } from "@/components/ui/page-shell";
import { DocumentsClient } from "@/features/students/DocumentsClient";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifySession } from "@/lib/auth/verify-session";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDocumentsPage({ params }: PageProps) {
  const { id: studentId } = await params;
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);

  if (
    !ctx ||
    (!ctx.permissions.has("profile.edit_any") && session.userId !== studentId)
  ) {
    return (
      <div className="p-6">
        <p className="text-destructive">
          Anda tidak memiliki izin untuk melihat halaman ini.
        </p>
      </div>
    );
  }

  const docResult = await getDocuments(studentId);
  const documents =
    "documents" in docResult && docResult.documents ? docResult.documents : [];

  return (
    <PageShell
      title="Dokumen Siswa"
      description="Unggah dan lihat dokumen siswa."
    >
      <DocumentsClient studentId={studentId} documents={documents} />
    </PageShell>
  );
}
