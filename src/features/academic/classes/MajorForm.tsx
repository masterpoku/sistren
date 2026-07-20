import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface MajorFormValues {
  name: string;
  description?: string | null;
}

export function MajorForm({ item }: { item?: MajorFormValues }) {
  return (
    <div className="grid gap-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="mjr-name">Nama Jurusan</Label>
        <Input
          id="mjr-name"
          name="name"
          placeholder="TKJ, RPL, Akuntansi"
          defaultValue={item?.name ?? ""}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mjr-description">Deskripsi</Label>
        <Input
          id="mjr-description"
          name="description"
          placeholder="(opsional)"
          defaultValue={item?.description ?? ""}
        />
      </div>
    </div>
  );
}
