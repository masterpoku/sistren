import { getSchoolDocuments } from "@/actions/documents-admin";
import { PageShell } from "@/components/ui/page-shell";
import DocumentsAdminClient from "@/features/documents/DocumentsAdminClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function DocumentsPage() {
  await verifyRoleLevel(80);
  const result = await getSchoolDocuments();
  const documents = "documents" in result ? (result.documents ?? []) : [];

  return (
    <PageShell
      title="Dokumen Sekolah"
      description="Kelola dokumen kebijakan, surat edaran, formulir, dan laporan."
    >
      <DocumentsAdminClient data={documents} />
    </PageShell>
  );
}
