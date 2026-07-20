"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface GraduateActionProps {
  studentId: string;
  semesterId: number;
  studentName: string;
  disabled?: boolean;
}

export function GraduateAction({
  studentId,
  semesterId,
  studentName: _studentName,
  disabled,
}: GraduateActionProps) {
  const router = useRouter();

  return (
    <Button
      type="button"
      size="sm"
      variant="default"
      disabled={disabled}
      onClick={() => router.push(`/students/${studentId}/graduate?semesterId=${semesterId}`)}
    >
      Aksi
    </Button>
  );
}
