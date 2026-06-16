import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Teacher = { id: string; name: string };
type Class = { id: number; name: string };
type Subject = { id: number; name: string };
type Semester = { id: number; name: string; academicYear: string };

interface AssignmentFormProps {
    teachers: Teacher[];
    classes: Class[];
    subjects: Subject[];
    semesters: Semester[];
}

export function AssignmentForm({
    teachers,
    classes,
    subjects,
    semesters,
}: AssignmentFormProps) {
    return (
        <div className="grid gap-4 py-2">
            <div className="space-y-2">
                <Label htmlFor="teacherId">Guru</Label>
                <Select name="teacherId" required>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih guru" />
                    </SelectTrigger>
                    <SelectContent>
                        {teachers.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                                {t.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="classId">Kelas</Label>
                <Select name="classId" required>
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
            <div className="space-y-2">
                <Label htmlFor="subjectId">Mata Pelajaran</Label>
                <Select name="subjectId" required>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih mapel" />
                    </SelectTrigger>
                    <SelectContent>
                        {subjects.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                                {s.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="semesterId">Semester</Label>
                <Select name="semesterId" required>
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
        </div>
    );
}
