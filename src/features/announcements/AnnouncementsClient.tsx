"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import type { ColumnDef } from "@tanstack/react-table";
import { createAnnouncement } from "@/actions/announcements";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ActionCell } from "@/components/ui/data-table";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  formatDate,
  type StatusConfig,
} from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Announcement = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  priority: string | null;
  publishedAt: Date | null;
  createdAt: Date | null;
};

const CATEGORY_COLORS: Record<string, string> = {
  umum: "bg-blue-100 text-blue-800",
  akademik: "bg-green-100 text-green-800",
  keuangan: "bg-yellow-100 text-yellow-800",
  kegiatan: "bg-purple-100 text-purple-800",
};

export function createAnnouncementColumns(roleLevel: number): ColumnDef<Announcement>[] {
  return [
    {
      accessorKey: "title",
      header: "Judul",
    },
    {
      accessorKey: "description",
      header: "Deskripsi",
      cell: ({ row }) => row.getValue("description") ?? "-",
    },
    {
      accessorKey: "category",
      header: "Kategori",
      cell: ({ row }) => {
        const category = row.getValue("category") as string;
        const colorClass = CATEGORY_COLORS[category] ?? "bg-gray-100 text-gray-800";
        const label = CATEGORY_LABELS[category] ?? category ?? "-";
        return (
          <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${colorClass}`}>
            {label}
          </span>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Prioritas",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        const config: StatusConfig = PRIORITY_LABELS[priority ?? "normal"] ?? PRIORITY_LABELS.normal;
        return (
          <Badge variant={config.variant}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "publishedAt",
      header: "Status",
      cell: ({ row }) => {
        const publishedAt = row.getValue("publishedAt");
        return publishedAt ? (
          <Badge variant="default">Published</Badge>
        ) : (
          <Badge variant="secondary">Draft</Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Tanggal",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const isPublished = !!row.original.publishedAt;
        return (
          <ActionCell
            onCustom={
              roleLevel >= 80
                ? [
                    {
                      label: isPublished ? "Unpublish" : "Publish",
                      variant: "outline" as const,
                      onClick: async () => {
                        const mod = await import("@/actions/announcements");
                        if (isPublished) {
                          await mod.unpublishAnnouncement(String(row.original.id));
                        } else {
                          await mod.publishAnnouncement(String(row.original.id));
                        }
                      },
                    },
                  ]
                : undefined
            }
            onDelete={async () => {
              const { deleteAnnouncement } = await import("@/actions/announcements");
              await deleteAnnouncement(String(row.original.id));
            }}
          />
        );
      },
    },
  ];
}

interface AnnouncementsClientProps {
  data: Announcement[];
  roleLevel: number;
}

export function AnnouncementsClient({
  data,
  roleLevel,
}: AnnouncementsClientProps) {
  const router = useRouter();
const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createAnnouncement(formData);
      if (result && "error" in result) {
toast({ variant: "destructive", description: result.error });
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengumuman</h1>
        <p className="text-muted-foreground">
          Informasi dan pengumuman sekolah.
        </p>
      </div>

      {roleLevel >= 80 && (
        <Card>
          <CardHeader>
            <CardTitle>Buat Pengumuman</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Judul pengumuman"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="umum">Umum</SelectItem>
                      <SelectItem value="akademik">Akademik</SelectItem>
                      <SelectItem value="keuangan">Keuangan</SelectItem>
                      <SelectItem value="kegiatan">Kegiatan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioritas</Label>
                  <Select name="priority" required defaultValue="normal">
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih prioritas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="important">Penting</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi Singkat</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Deskripsi singkat (opsional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Konten</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Isi pengumuman lengkap"
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan..." : "Publikasikan"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable
        columns={createAnnouncementColumns(roleLevel)}
        data={data}
        searchKey="title"
        searchPlaceholder="Cari judul..."
        exportFilename="pengumuman"
        emptyMessage="Belum ada pengumuman."
      />
    </div>
  );
}
