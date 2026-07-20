import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface SubjectFormValues {
  name: string;
  code: string | null;
  classId: number | null;
  credits: number | null;
}

interface SubjectFormProps {
  item?: SubjectFormValues;
  classList: { id: number; name: string; code: string }[];
  defaultClassId?: number;
}

export function SubjectForm({ item, classList, defaultClassId }: SubjectFormProps) {
  return (
    <div className="grid gap-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="subj-name">Nama Mata Pelajaran</Label>
        <Input
          id="subj-name"
          name="name"
          placeholder="Matematika"
          defaultValue={item?.name ?? ""}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subj-code">Kode (opsional)</Label>
        <Input
          id="subj-code"
          name="code"
          placeholder="MTK"
          defaultValue={item?.code ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subj-class">Kelas</Label>
        <select
          id="subj-class"
          name="classId"
          defaultValue={item?.classId != null ? String(item.classId) : defaultClassId != null ? String(defaultClassId) : ""}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          <option value="" disabled>
            Pilih kelas
          </option>
          {classList.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.code}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subj-credits">SKS / Jam per Minggu</Label>
        <Input
          id="subj-credits"
          name="credits"
          type="number"
          min="0"
          max="20"
          placeholder="4"
          defaultValue={String(item?.credits ?? 0)}
          required
        />
      </div>
    </div>
  );
}
