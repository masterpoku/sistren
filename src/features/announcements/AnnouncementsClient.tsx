"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ActionCell } from "@/components/ui/data-table";
import {
    CATEGORY_LABELS,
    PRIORITY_LABELS,
    formatDate,
    type StatusConfig,
} from "@/components/ui/data-table";
import { PageShell } from "@/components/ui/page-shell";
import { useToast } from "@/hooks/use-toast";
import { AnnouncementDialog } from "@/features/announcements/AnnouncementDialog";

type Announcement = {
    id: number;
    title: string;
    description: string | null;
    content: string;
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

function AnnouncementActions({
    item,
    roleLevel,
}: {
    item: Announcement;
    roleLevel: number;
}) {
    const { toast } = useToast();
    const isPublished = Boolean(item.publishedAt);

    async function handlePublishToggle() {
        const mod = await import("@/actions/announcements");
        const result = isPublished
            ? await mod.unpublishAnnouncement(String(item.id))
            : await mod.publishAnnouncement(String(item.id));
        if (result && "error" in result && result.error) {
            toast({ variant: "destructive", description: result.error });
            return;
        }
        toast({ description: isPublished ? "Pengumuman di-unpublish." : "Pengumuman dipublikasikan." });
    }

    async function handleDelete() {
        const { deleteAnnouncement } = await import("@/actions/announcements");
        const result = await deleteAnnouncement(String(item.id));
        if (result && "error" in result && result.error) {
            toast({ variant: "destructive", description: result.error });
            return;
        }
        toast({ description: "Pengumuman dihapus." });
    }

    return (
        <div className="flex items-center gap-2">
            <AnnouncementDialog
                item={{
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    content: item.content,
                    category: item.category,
                    priority: item.priority ?? "normal",
                }}
                trigger={
                    <Button type="button" variant="outline" size="sm">
                        Edit
                    </Button>
                }
            />
            <ActionCell
                onCustom={
                    roleLevel >= 80
                        ? [
                            {
                                label: isPublished ? "Unpublish" : "Publish",
                                onClick: handlePublishToggle,
                            },
                        ]
                        : undefined
                }
                onDelete={handleDelete}
            />
        </div>
    );
}

interface AnnouncementsClientProps {
    data: Announcement[];
    roleLevel: number;
}

export function AnnouncementsClient({ data, roleLevel }: AnnouncementsClientProps) {
    const columns: ColumnDef<Announcement>[] = [
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
                return <Badge variant={config.variant}>{config.label}</Badge>;
            },
        },
        {
            accessorKey: "publishedAt",
            header: "Status",
            cell: ({ row }) =>
                row.getValue("publishedAt") ? (
                    <Badge variant="default">Published</Badge>
                ) : (
                    <Badge variant="secondary">Draft</Badge>
                ),
        },
        {
            accessorKey: "createdAt",
            header: "Tanggal",
            cell: ({ row }) => formatDate(row.original.createdAt),
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => (
                <AnnouncementActions item={row.original} roleLevel={roleLevel} />
            ),
        },
    ];

    return (
        <PageShell
            title="Pengumuman"
            description="Informasi dan pengumuman sekolah."
            actions={
                roleLevel >= 80 ? (
                    <AnnouncementDialog
                        trigger={<Button type="button">Buat Pengumuman</Button>}
                    />
                ) : undefined
            }
        >
            <DataTable
                columns={columns}
                data={data}
                searchKey="title"
                searchPlaceholder="Cari judul..."
                exportFilename="pengumuman"
                emptyMessage="Belum ada pengumuman."
            />
        </PageShell>
    );
}
