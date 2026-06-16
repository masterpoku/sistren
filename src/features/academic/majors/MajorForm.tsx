import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface MajorFormValues {
    name: string;
    description: string | null;
}

export function MajorForm({ item }: { item?: MajorFormValues }) {
    return (
        <div className="grid gap-4 py-2">
            <div className="space-y-2">
                <Label htmlFor="major-name">Nama Jurusan</Label>
                <Input
                    id="major-name"
                    name="name"
                    placeholder="IPA, IPS, Bahasa"
                    defaultValue={item?.name ?? ""}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="major-desc">Deskripsi</Label>
                <Input
                    id="major-desc"
                    name="description"
                    placeholder="Ilmu Pengetahuan Alam"
                    defaultValue={item?.description ?? ""}
                />
            </div>
        </div>
    );
}
