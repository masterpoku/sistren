"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEnrollment, updateEnrollment } from "@/actions/enrollments";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { EnrollmentForm } from "./EnrollmentForm";

interface EnrollmentDialogProps {
    students: { id: string; name: string }[];
    semesters: { id: number; name: string; academicYear: string }[];
    classes: { id: number; name: string }[];
    trigger: ReactNode;
    item?: {
        id: number;
        studentId: string;
        semesterId: number;
        classId: number;
    };
}

export function EnrollmentDialog({
    students,
    semesters,
    classes,
    trigger,
    item,
}: EnrollmentDialogProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const isEdit = Boolean(item);

    async function handleSubmit(formData: FormData) {
        const result = isEdit && item
            ? await updateEnrollment(String(item.id), formData)
            : await createEnrollment(formData);
        if (result && "error" in result && result.error) {
            toast({ variant: "destructive", description: result.error });
            return;
        }
        toast({ description: isEdit ? "Pendaftaran diperbarui." : "Pendaftaran berhasil." });
        setOpen(false);
        router.refresh();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Pendaftaran" : "Tambah Pendaftaran"}</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit}>
                    {isEdit && item && (
                        <input type="hidden" name="enrollmentId" value={item.id} />
                    )}
                    <EnrollmentForm
                        students={students}
                        semesters={semesters}
                        classes={classes}
                        defaults={
                            item
                                ? {
                                    studentId: item.studentId,
                                    semesterId: item.semesterId,
                                    classId: item.classId,
                                }
                                : undefined
                        }
                    />
                    <div className="flex justify-end gap-2 pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Batal
                            </Button>
                        </DialogClose>
                        <Button type="submit">{isEdit ? "Simpan" : "Daftarkan"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
