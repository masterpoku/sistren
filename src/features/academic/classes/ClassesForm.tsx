import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ClassesFormValues {
  name: string;
  code: string;
}

export function ClassesForm({ item }: { item?: ClassesFormValues }) {
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
        <Label htmlFor="cls-code">Kode</Label>
        <Input
          id="cls-code"
          name="code"
          placeholder="X-1, XI-2"
          defaultValue={item?.code ?? ""}
          required
        />
      </div>
    </div>
  );
}
