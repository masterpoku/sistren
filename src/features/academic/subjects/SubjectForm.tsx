import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface SubjectFormValues {
    name: string;
    code: string | null;
    credits: number | null;
}

export function SubjectForm({ item }: { item?: SubjectFormValues }) {
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
