import { getDocuments } from "@/actions/documents";
import { DocumentUploadForm } from "@/features/students/DocumentUploadForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifySession } from "@/lib/auth/verify-session";

const DOCUMENT_TYPES = [
  { value: "ijasah", label: "Ijazah (SMP)" },
  { value: "skhun", label: "SKHUN" },
  { value: "skl", label: "Surat Keterangan Lulus" },
  { value: "aktaKelahiran", label: "Akta Kelahiran" },
  { value: "kk", label: "Kartu Keluarga" },
  { value: "ktpAyah", label: "KTP Ayah" },
  { value: "ktpIbu", label: "KTP Ibu" },
  { value: "kip", label: "KIP" },
  { value: "passFoto", label: "Pas Foto 3x4" },
  { value: "rapor", label: "Rapor" },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDocumentsPage({ params }: PageProps) {
  const { id: studentId } = await params;
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);

  // Permission check: profile.edit_any (admin/guru) OR own profile
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
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dokumen Siswa</h1>
        <p className="text-muted-foreground">Unggah dan lihat dokumen siswa.</p>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Unggah Dokumen</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUploadForm studentId={studentId} />
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle>Dokumen Tersimpan</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-muted-foreground">Belum ada dokumen.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jenis Dokumen</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc: { type: string; hasData: boolean }) => {
                  const docInfo = DOCUMENT_TYPES.find(
                    (d) => d.value === doc.type
                  );
                  return (
                    <TableRow key={doc.type}>
                      <TableCell className="font-medium">
                        {docInfo?.label ?? doc.type}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-green-600">
                          ✓ Tersimpan
                        </span>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`/api/documents/${studentId}/${doc.type}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="outline">
                            Lihat
                          </Button>
                        </a>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
