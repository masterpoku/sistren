import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Major = { id: number; name: string };

export interface ClassesFormValues {
  name: string;
  majorId?: number | null;
  capacity?: number | null;
}

export function ClassesForm({ item, majors }: { item?: ClassesFormValues; majors: Major[] }) {
  return (
    <div className="grid gap-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="cls-name">Nama Kelas</Label>
        <Input
          id="cls-name"
          name="name"
          placeholder="X, XI, XII"
          defaultValue={item?.name ?? ""}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cls-majorId">Jurusan</Label>
        <select
          id="cls-majorId"
          name="majorId"
          defaultValue={item?.majorId ?? ""}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          <option value="">Pilih jurusan...</option>
          {majors.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="cls-capacity">Kapasitas</Label>
        <Input
          type="number"
          id="cls-capacity"
          name="capacity"
          placeholder="32"
          min={0}
          max={100}
          defaultValue={item?.capacity ?? ""}
        />
        <p className="text-xs text-muted-foreground">Kosongi jika tidak terbatas.</p>
      </div>
    </div>
  );
}
