"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  createAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
  unpublishAnnouncement,
} from "@/actions/announcements";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type Announcement = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  priority: string | null;
  publishedAt: Date | null;
};

interface AnnouncementsClientProps {
  data: Announcement[];
  roleLevel: number;
}

function priorityBadge(priority: string | null | undefined) {
  switch (priority) {
    case "urgent":
      return <Badge variant="destructive">Urgent</Badge>;
    case "important":
      return <Badge variant="default">Penting</Badge>;
    default:
      return <Badge variant="secondary">Normal</Badge>;
  }
}

function categoryBadge(category: string | null | undefined) {
  const colors: Record<string, string> = {
    umum: "bg-blue-100 text-blue-800",
    akademik: "bg-green-100 text-green-800",
    keuangan: "bg-yellow-100 text-yellow-800",
    kegiatan: "bg-purple-100 text-purple-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${colors[category ?? ""] ?? "bg-gray-100 text-gray-800"}`}
    >
      {category ?? "-"}
    </span>
  );
}

export function AnnouncementsClient({
  data,
  roleLevel,
}: AnnouncementsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createAnnouncement(formData);
      if (result && "error" in result) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  }

  function handlePublish(id: number) {
    startTransition(async () => {
      await publishAnnouncement(String(id));
      router.refresh();
    });
  }

  function handleUnpublish(id: number) {
    startTransition(async () => {
      await unpublishAnnouncement(String(id));
      router.refresh();
    });
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      await deleteAnnouncement(String(id));
      router.refresh();
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

      {data.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Belum ada pengumuman.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pengumuman</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Prioritas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  {roleLevel >= 80 && <TableHead>Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                      {a.description ?? "-"}
                    </TableCell>
                    <TableCell>{categoryBadge(a.category)}</TableCell>
                    <TableCell>{priorityBadge(a.priority)}</TableCell>
                    <TableCell>
                      {a.publishedAt ? (
                        <Badge variant="default">Published</Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.publishedAt
                        ? new Date(a.publishedAt).toLocaleDateString("id-ID")
                        : "-"}
                    </TableCell>
                    {roleLevel >= 80 && (
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          {!a.publishedAt ? (
                            <Button
                              size="sm"
                              onClick={() => handlePublish(a.id)}
                            >
                              Publish
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnpublish(a.id)}
                            >
                              Unpublish
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(a.id)}
                          >
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
