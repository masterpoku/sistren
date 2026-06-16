import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface SemesterFormValues {
    name: string;
    academicYear: string | null;
    isActive: boolean | null;
}

export function SemesterForm({ item }: { item?: SemesterFormValues }) {
    return (
        <div className="grid gap-4 py-2">
            <div className="space-y-2">
                <Label htmlFor="sem-name">Nama Semester</Label>
                <Input
                    id="sem-name"
                    name="name"
                    placeholder="Ganjil 2026/2027"
                    defaultValue={item?.name ?? ""}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="sem-year">Tahun Ajaran</Label>
                <Input
                    id="sem-year"
                    name="academicYear"
                    placeholder="2026/2027"
                    defaultValue={item?.academicYear ?? ""}
                    required
                />
            </div>
        </div>
    );
}
