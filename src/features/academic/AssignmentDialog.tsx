"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { assignTeacher } from "@/actions/academic";
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
import { AssignmentForm } from "./AssignmentForm";

type Teacher = { id: string; name: string };
type Class = { id: number; name: string; code: string };
type Subject = { id: number; name: string };
type Semester = { id: number; name: string; academicYear: string };

interface AssignmentDialogProps {
  teachers: Teacher[];
  classes: Class[];
  subjects: Subject[];
  semesters: Semester[];
  trigger: ReactNode;
}

export function AssignmentDialog({
  teachers,
  classes,
  subjects,
  semesters,
  trigger,
}: AssignmentDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(formData: FormData) {
    const result = await assignTeacher(formData);
    if (result && "error" in result) {
      toast({ variant: "destructive", description: result.error });
      return;
    }
    toast({ description: "Tugas berhasil ditambahkan." });
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Tugas Guru</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit}>
          <AssignmentForm
            teachers={teachers}
            classes={classes}
            subjects={subjects}
            semesters={semesters}
          />
          <div className="flex justify-end gap-2 pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit">Tambah</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
