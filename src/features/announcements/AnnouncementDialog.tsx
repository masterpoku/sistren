"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAnnouncement, updateAnnouncement } from "@/actions/announcements";
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
import { AnnouncementForm, type AnnouncementFormValues } from "./AnnouncementForm";

interface AnnouncementDialogProps {
    item?: AnnouncementFormValues & { id: number };
    trigger: ReactNode;
}

export function AnnouncementDialog({ item, trigger }: AnnouncementDialogProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const isEdit = item !== undefined;

    async function handleSubmit(formData: FormData) {
        const result = isEdit
            ? await updateAnnouncement(String(item!.id), formData)
            : await createAnnouncement(formData);
        if (result && "error" in result) {
            toast({ variant: "destructive", description: result.error });
            return;
        }
        toast({ description: isEdit ? "Pengumuman diperbarui." : "Pengumuman dibuat." });
        setOpen(false);
        router.refresh();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? `Edit: ${item!.title}` : "Buat Pengumuman"}
                    </DialogTitle>
                </DialogHeader>
                <form action={handleSubmit}>
                    <AnnouncementForm item={item} />
                    <div className="flex justify-end gap-2 pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Batal
                            </Button>
                        </DialogClose>
                        <Button type="submit">{isEdit ? "Simpan" : "Buat"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
