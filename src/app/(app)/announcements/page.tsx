import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
  unpublishAnnouncement,
} from '@/actions/announcements';
import { verifySession } from '@/lib/auth/verify-session';
import { getAuthContext } from '@/lib/auth/permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function priorityBadge(priority: string | null | undefined) {
  switch (priority) {
    case 'urgent':
      return <Badge variant="destructive">Urgent</Badge>;
    case 'important':
      return <Badge variant="default">Penting</Badge>;
    default:
      return <Badge variant="secondary">Normal</Badge>;
  }
}

function categoryBadge(category: string | null | undefined) {
  const colors: Record<string, string> = {
    umum: 'bg-blue-100 text-blue-800',
    akademik: 'bg-green-100 text-green-800',
    keuangan: 'bg-yellow-100 text-yellow-800',
    kegiatan: 'bg-purple-100 text-purple-800',
  };
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${colors[category ?? ''] ?? 'bg-gray-100 text-gray-800'}`}>
      {category ?? '-'}
    </span>
  );
}

export default async function AnnouncementsPage() {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  const roleLevel = ctx?.roleLevel ?? 0;

  const announcementList = await getAnnouncements();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengumuman</h1>
        <p className="text-muted-foreground">Informasi dan pengumuman sekolah.</p>
      </div>

      {/* Create Form — admin only */}
      {roleLevel >= 80 && (
        <Card>
          <CardHeader>
            <CardTitle>Buat Pengumuman</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData: FormData) => {
                'use server';
                const result = await createAnnouncement(formData);
                if (result && 'error' in result) {
                  throw new Error(result.error);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul</Label>
                  <Input id="title" name="title" placeholder="Judul pengumuman" required />
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
                <Input id="description" name="description" placeholder="Deskripsi singkat (opsional)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Konten</Label>
                <Textarea id="content" name="content" placeholder="Isi pengumuman lengkap" rows={4} required />
              </div>
              <Button type="submit">Publikasikan</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Announcement List */}
      {announcementList.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Belum ada pengumuman.</p>
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
                {announcementList.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                      {a.description ?? '-'}
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
                      {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('id-ID') : '-'}
                    </TableCell>
                    {roleLevel >= 80 && (
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          {!a.publishedAt ? (
                            <form action={async () => {
                              'use server';
                              await publishAnnouncement(String(a.id));
                            }}>
                              <Button size="sm" type="submit">Publish</Button>
                            </form>
                          ) : (
                            <form action={async () => {
                              'use server';
                              await unpublishAnnouncement(String(a.id));
                            }}>
                              <Button size="sm" variant="outline" type="submit">Unpublish</Button>
                            </form>
                          )}
                          <form action={async () => {
                            'use server';
                            await deleteAnnouncement(String(a.id));
                          }}>
                            <Button size="sm" variant="destructive" type="submit">Hapus</Button>
                          </form>
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