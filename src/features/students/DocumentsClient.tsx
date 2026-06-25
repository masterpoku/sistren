"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { PageShell } from "@/components/ui/page-shell";
import { DocumentUploadDialog } from "@/features/students/DocumentUploadDialog";

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

type DocumentRow = { type: string; hasData: boolean };

interface DocumentsClientProps {
  studentId: string;
  documents: DocumentRow[];
}

export function DocumentsClient({
  studentId,
  documents,
}: DocumentsClientProps) {
  const columns: ColumnDef<DocumentRow>[] = [
    {
      accessorKey: "type",
      header: "Jenis Dokumen",
      cell: ({ row }) => {
        const docInfo = DOCUMENT_TYPES.find(
          (d) => d.value === row.original.type
        );
        return (
          <span className="font-medium">
            {docInfo?.label ?? row.original.type}
          </span>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: () => <span className="text-sm text-green-600">✓ Tersimpan</span>,
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <Button asChild size="sm" variant="outline">
          <a
            href={`/api/documents/${studentId}/${row.original.type}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Lihat
          </a>
        </Button>
      ),
    },
  ];

  return (
    <PageShell
      title="Dokumen Siswa"
      description="Kelola dokumen siswa terenkripsi."
      actions={
        <DocumentUploadDialog
          studentId={studentId}
          trigger={<Button type="button">Unggah Dokumen</Button>}
        />
      }
    >
      <DataTable
        columns={columns}
        data={documents}
        searchKey="type"
        searchPlaceholder="Cari dokumen..."
        exportFilename="dokumen-siswa"
        emptyMessage="Belum ada dokumen."
      />
    </PageShell>
  );
}
