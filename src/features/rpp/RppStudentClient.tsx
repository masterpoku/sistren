"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";

export interface StudentRpp {
  id: number;
  title: string;
  description: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  subjectName: string | null;
  teacherName: string | null;
  createdAt: Date | null;
}

interface RppStudentClientProps {
  documents: StudentRpp[];
}

export function RppStudentClient({ documents }: RppStudentClientProps) {
  return (
    <PageShell
      title="RPP Mata Pelajaran"
      description="Rencana Pelaksanaan Pembelajaran dari guru mata pelajaran Anda."
    >
      <Card>
        <CardHeader>
          <CardTitle>Daftar RPP</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Belum ada RPP yang tersedia.
            </p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="flex-1 space-y-1">
                    <h3 className="font-medium">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {doc.subjectName ?? "-"} - {doc.teacherName ?? "-"}
                    </p>
                    {doc.description && (
                      <p className="text-sm text-muted-foreground">
                        {doc.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {doc.fileName} ({Math.round(doc.fileSize / 1024)} KB)
                    </p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/api/rpp/${doc.id}/download`} download>
                      Unduh
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
