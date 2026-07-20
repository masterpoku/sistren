"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { bulkCreateEnrollment } from "@/actions/enrollments";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface BulkEnrollmentFormProps {
  classList: { id: number; name: string; code: string }[];
  semesterList: { id: number; name: string; academicYear: string }[];
}

export function BulkEnrollmentForm({
  classList,
  semesterList,
}: BulkEnrollmentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const classId = formData.get("classId") as string | null;
      const semesterId = formData.get("semesterId") as string | null;
      if (!classId || !semesterId) {
        toast({
          variant: "destructive",
          description: "Kelas dan semester wajib dipilih.",
        });
        return;
      }
      const result = await bulkCreateEnrollment(classId, semesterId);

      if ("error" in result) {
        toast({ variant: "destructive", description: result.error as string });
      } else if (result.failed) {
        toast({
          variant: "destructive",
          description: result.message || "Bulk enrollment failed.",
        });
      } else {
        toast({
          description: `Berhasil mendaftarkan ${result.inserted} siswa. ${result.skipped} sudah terdaftar.`,
        });
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2">
      <form action={handleSubmit} className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <Label>Kelas</Label>
          <Select name="classId" required>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Pilih kelas" />
            </SelectTrigger>
            <SelectContent>
              {classList.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Semester</Label>
          <Select name="semesterId" required>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Pilih semester" />
            </SelectTrigger>
            <SelectContent>
              {semesterList.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name} ({s.academicYear})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Processing..." : "Enroll Semua Siswa"}
        </Button>
      </form>
    </div>
  );
}
