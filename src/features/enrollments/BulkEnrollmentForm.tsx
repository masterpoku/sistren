"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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

interface BulkEnrollmentFormProps {
  classList: { id: number; name: string }[];
  semesterList: { id: number; name: string; academicYear: string }[];
}

export function BulkEnrollmentForm({
  classList,
  semesterList,
}: BulkEnrollmentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const classId = formData.get("classId") as string | null;
      const semesterId = formData.get("semesterId") as string | null;
      if (!classId || !semesterId) {
        setMessage({
          type: "error",
          text: "Kelas dan semester wajib dipilih.",
        });
        return;
      }
      const result = await bulkCreateEnrollment(
        classId as string,
        semesterId as string
      );

      if ("error" in result) {
        setMessage({ type: "error", text: result.error as string });
      } else if (result.failed) {
        setMessage({
          type: "error",
          text: result.message || "Bulk enrollment failed.",
        });
      } else {
        setMessage({
          type: "success",
          text: `Berhasil mendaftarkan ${result.inserted} siswa. ${result.skipped} sudah terdaftar.`,
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
                  {c.name}
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
      {message && (
        <p
          className={
            message.type === "error"
              ? "text-sm text-red-600"
              : "text-sm text-green-600"
          }
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
