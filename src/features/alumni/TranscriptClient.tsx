"use client";

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

const DOCUMENT_TYPES = [
  { value: "rapor", label: "Rapor (Nilai Semester)" },
  { value: "ijasah", label: "Ijazah" },
  { value: "skhun", label: "SKHUN" },
  { value: "skl", label: "Surat Keterangan Lulus" },
];

type Document = { type: string };

interface TranscriptClientProps {
  documents: Document[];
  userId: string;
}

export function TranscriptClient({ documents, userId }: TranscriptClientProps) {
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
                            href={`/api/documents/${userId}/${dt.value}`}
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
