"use client";

import { DownloadSimple, FileText, Trash } from "@phosphor-icons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type SchoolDocumentRow = {
    id: number;
    title: string;
    description: string | null;
    fileName: string;
    fileType: string;
    fileSize: number;
    category: string | null;
    isPublic: boolean;
    uploadedBy: string;
    uploaderName: string | null;
    createdAt: Date | string;
};

interface DocumentsAdminClientProps {
    data: SchoolDocumentRow[];
}

const CATEGORIES = [
    { value: "kebijakan", label: "Kebijakan" },
    { value: "surat_edaran", label: "Surat Edaran" },
    { value: "formulir", label: "Formulir" },
    { value: "laporan", label: "Laporan" },
] as const;

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d: Date | string): string {
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function DocumentsAdminClient({ data }: DocumentsAdminClientProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    function handleSubmit(formData: FormData) {
        if (!selectedFile) {
            toast({ variant: "destructive", description: "Pilih file terlebih dahulu." });
            return;
        }
        formData.set("file", selectedFile);
        startTransition(async () => {
            const { uploadSchoolDocument } = await import("@/actions/documents-admin");
            const result = await uploadSchoolDocument(formData);
            if ("error" in result) {
                toast({ variant: "destructive", description: result.error ?? "Gagal mengunggah" });
                return;
            }
            setOpen(false);
            setSelectedFile(null);
            toast({ description: "Dokumen diunggah." });
        });
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
        }
    }

    async function handleDelete(id: number) {
        const { deleteSchoolDocument } = await import("@/actions/documents-admin");
        const result = await deleteSchoolDocument(id);
        if ("error" in result) {
            toast({ variant: "destructive", description: result.error });
            return;
        }
        toast({ description: "Dokumen dihapus." });
    }

    const columns: ColumnDef<SchoolDocumentRow>[] = [
        {
            accessorKey: "title",
            header: "Judul",
            cell: ({ row }) => (
                <div className="min-w-0">
                    <p className="font-medium truncate">{row.original.title}</p>
                    {row.original.description ? (
                        <p className="text-xs text-muted-foreground truncate">
                            {row.original.description}
                        </p>
                    ) : null}
                </div>
            ),
        },
        {
            accessorKey: "category",
            header: "Kategori",
            cell: ({ row }) =>
                row.original.category ? (
                    <span className="text-xs capitalize">{row.original.category.replace("_", " ")}</span>
                ) : (
                    <span className="text-muted-foreground">-</span>
                ),
        },
        {
            id: "file",
            header: "File",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate max-w-[200px]" title={row.original.fileName}>
                        {row.original.fileName}
                    </span>
                    <span>({formatBytes(row.original.fileSize)})</span>
                </div>
            ),
        },
        {
            accessorKey: "uploaderName",
            header: "Diupload",
            cell: ({ row }) => (
                <div className="text-xs">
                    <p>{row.original.uploaderName ?? "-"}</p>
                    <p className="text-muted-foreground">{formatDate(row.original.createdAt)}</p>
                </div>
            ),
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/api/documents/school/${row.original.id}`, "_blank")}
                    >
                        <DownloadSimple className="h-4 w-4 mr-1" />
                        Unduh
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            if (confirm(`Hapus dokumen '${row.original.title}'?`)) {
                                handleDelete(row.original.id);
                            }
                        }}
                    >
                        <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-end">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <FileText className="h-4 w-4 mr-1" />
                            Unggah Dokumen
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <form action={handleSubmit} className="space-y-4">
                            <DialogHeader>
                                <DialogTitle>Unggah Dokumen Sekolah</DialogTitle>
                                <DialogDescription>
                                    File akan dienkripsi (AES-256-GCM) sebelum disimpan.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2">
                                <Label htmlFor="title">Judul</Label>
                                <Input id="title" name="title" required maxLength={255} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi (opsional)</Label>
                                <Input id="description" name="description" maxLength={2000} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Kategori</Label>
                                <Select name="category">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kategori..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((c) => (
                                            <SelectItem key={c.value} value={c.value}>
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>File</Label>
                                <button
                                    type="button"
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setDragOver(true);
                                    }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed text-sm transition-colors ${
                                        dragOver
                                            ? "border-primary bg-primary/5"
                                            : "border-muted-foreground/25 hover:border-primary/50"
                                    }`}
                                >
                                    <FileText className="h-8 w-8 text-muted-foreground mb-1" />
                                    <p className="font-medium">
                                        {selectedFile ? selectedFile.name : "Klik atau drop file di sini"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Maks 10MB
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setSelectedFile(file);
                                        }}
                                    />
                                </button>
                            </div>
                            <input type="hidden" name="isPublic" value="false" />
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    disabled={isPending}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={isPending || !selectedFile}>
                                    {isPending ? "Mengunggah..." : "Unggah"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <DataTable
                columns={columns}
                data={data}
                searchKey="title"
                searchPlaceholder="Cari dokumen..."
                exportFilename="dokumen-sekolah"
                emptyMessage="Belum ada dokumen."
            />
        </div>
    );
}
