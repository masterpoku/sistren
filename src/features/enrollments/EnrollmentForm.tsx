import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface EnrollmentFormProps {
    students: { id: string; name: string }[];
    semesters: { id: number; name: string; academicYear: string }[];
    classes: { id: number; name: string }[];
    defaults?: {
        studentId?: string;
        semesterId?: number;
        classId?: number;
    };
}

export function EnrollmentForm({
    students,
    semesters,
    classes,
    defaults,
}: EnrollmentFormProps) {
    return (
        <div className="grid gap-4 py-2">
            <div className="space-y-2">
                <Label htmlFor="studentId">Siswa</Label>
                <Select name="studentId" required defaultValue={defaults?.studentId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih siswa" />
                    </SelectTrigger>
                    <SelectContent>
                        {students.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                                {s.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="semesterId">Semester</Label>
                <Select name="semesterId" required defaultValue={defaults?.semesterId ? String(defaults.semesterId) : undefined}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih semester" />
                    </SelectTrigger>
                    <SelectContent>
                        {semesters.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                                {s.name} ({s.academicYear})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="classId">Kelas</Label>
                <Select name="classId" required defaultValue={defaults?.classId ? String(defaults.classId) : undefined}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                    <SelectContent>
                        {classes.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
