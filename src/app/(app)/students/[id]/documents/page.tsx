import { getDocuments, uploadDocument } from '@/actions/documents';
import { verifySession } from '@/lib/auth/verify-session';
import { getAuthContext } from '@/lib/auth/permissions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  { value: 'ijasah', label: 'Ijazah (SMP)' },
  { value: 'skhun', label: 'SKHUN' },
  { value: 'skl', label: 'Surat Keterangan Lulus' },
  { value: 'aktaKelahiran', label: 'Akta Kelahiran' },
  { value: 'kk', label: 'Kartu Keluarga' },
  { value: 'ktpAyah', label: 'KTP Ayah' },
  { value: 'ktpIbu', label: 'KTP Ibu' },
  { value: 'kip', label: 'KIP' },
  { value: 'passFoto', label: 'Pas Foto 3x4' },
  { value: 'rapor', label: 'Rapor' },
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
    (!ctx.permissions.has('profile.edit_any') && session.userId !== studentId)
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
    'documents' in docResult && docResult.documents ? docResult.documents : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dokumen Siswa</h1>
        <p className="text-muted-foreground">Unggah dan lihat dokumen siswa.</p>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Unggah Dokumen</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              'use server';
              const result = await uploadDocument(formData);
              if (result && 'error' in result) {
                throw new Error(result.error);
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <input type="hidden" name="studentId" value={studentId} />

            <div className="space-y-2">
              <Label htmlFor="documentType">Jenis Dokumen</Label>
              <Select name="documentType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih dokumen" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((dt) => (
                    <SelectItem key={dt.value} value={dt.value}>
                      {dt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">File (PDF/Gambar, maks 16MB)</Label>
              <input
                type="file"
                id="file"
                name="file"
                accept=".pdf,.jpg,.jpeg,.png"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium"
              />
            </div>

            <div className="flex items-end">
              <Button type="submit" className="w-full">
                Unggah
              </Button>
            </div>
          </form>
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
