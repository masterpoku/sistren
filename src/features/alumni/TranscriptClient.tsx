"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";

const DOCUMENT_TYPES = [
  { value: "rapor", label: "Rapor (Nilai Semester)" },
  { value: "ijasah", label: "Ijazah" },
  { value: "skhun", label: "SKHUN" },
  { value: "skl", label: "Surat Keterangan Lulus" },
];

type Document = { type: string };
type EnrichedDocument = {
  value: string;
  label: string;
  hasDocument: boolean;
  userId: string;
};

export const columns: ColumnDef<EnrichedDocument>[] = [
  {
    accessorKey: "label",
    header: "Jenis Dokumen",
  },
  {
    accessorKey: "hasDocument",
    header: "Status",
    cell: ({ row }) =>
      row.original.hasDocument ? (
        <span className="text-sm text-green-600">✓ Tersedia</span>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      if (!row.original.hasDocument) return null;
      return (
        <a
          href={`/api/documents/${row.original.userId}/${row.original.value}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="sm" variant="outline">
            Unduh
          </Button>
        </a>
      );
    },
  },
];

interface TranscriptClientProps {
  documents: Document[];
  userId: string;
}

export function TranscriptClient({ documents, userId }: TranscriptClientProps) {
  const data: EnrichedDocument[] = DOCUMENT_TYPES.map((dt) => ({
    ...dt,
    hasDocument: documents.some((d) => d.type === dt.value),
    userId,
  }));

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

      <DataTable
        columns={columns}
        data={data}
        searchKey="label"
        searchPlaceholder="Cari dokumen..."
        exportFilename="transkrip"
        emptyMessage="Belum ada dokumen tersedia. Hubungi admin sekolah."
      />
    </div>
  );
}
