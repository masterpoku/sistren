import { verifySession } from '@/lib/auth/verify-session';
import { getAuthContext } from '@/lib/auth/permissions';
import { getDocuments } from '@/actions/documents';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DOCUMENT_TYPES = [
  { value: 'rapor', label: 'Rapor (Nilai Semester)' },
  { value: 'ijasah', label: 'Ijazah' },
  { value: 'skhun', label: 'SKHUN' },
  { value: 'skl', label: 'Surat Keterangan Lulus' },
];

export default async function AlumniTranscriptPage() {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx || ctx.roleLevel > 40) {
    redirect('/dashboard');
  }

  let documents: Array<{ type: string }> = [];
  try {
    const docResult = await getDocuments(session.userId);
    if ('documents' in docResult && Array.isArray(docResult.documents)) {
      documents = docResult.documents;
    }
  } catch {
    documents = [];
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span className="text-lg">🎓</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Transkrip Alumni
          </h1>
          <p className="text-muted-foreground">
            Unduh dokumen nilai dan ijazah.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dokumen Tersedia</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Belum ada dokumen tersedia. Hubungi admin sekolah.
            </p>
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
                {DOCUMENT_TYPES.map((dt) => {
                  const hasDoc = documents.some((d) => d.type === dt.value);
                  return (
                    <TableRow key={dt.value}>
                      <TableCell className="font-medium">{dt.label}</TableCell>
                      <TableCell>
                        {hasDoc ? (
                          <span className="text-sm text-green-600">
                            ✓ Tersedia
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {hasDoc && (
                          <a
                            href={`/api/documents/${session.userId}/${dt.value}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline">
                              Unduh
                            </Button>
                          </a>
                        )}
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
