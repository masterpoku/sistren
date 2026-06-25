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

export interface AnnouncementFormValues {
  title: string;
  description: string | null;
  content: string;
  category: string | null;
  priority: string;
}

export function AnnouncementForm({ item }: { item?: AnnouncementFormValues }) {
  return (
    <div className="grid gap-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="ann-title">Judul</Label>
        <Input
          id="ann-title"
          name="title"
          placeholder="Libur Nasional"
          defaultValue={item?.title ?? ""}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ann-desc">Deskripsi Singkat</Label>
        <Input
          id="ann-desc"
          name="description"
          placeholder="Ringkasan..."
          defaultValue={item?.description ?? ""}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ann-category">Kategori</Label>
          <Select name="category" defaultValue={item?.category ?? ""}>
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
          <Label htmlFor="ann-priority">Prioritas</Label>
          <Select name="priority" defaultValue={item?.priority ?? "normal"}>
            <SelectTrigger>
              <SelectValue />
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
        <Label htmlFor="ann-content">Konten</Label>
        <Textarea
          id="ann-content"
          name="content"
          rows={6}
          placeholder="Isi pengumuman lengkap..."
          defaultValue={item?.content ?? ""}
          required
        />
      </div>
    </div>
  );
}
