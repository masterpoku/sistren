"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { approveStudent, rejectStudent } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PendingStudent = {
  id: string;
  name: string;
  email: string;
  createdAt: Date | null;
  nisn: string | null;
};

interface ApprovalsClientProps {
  data: PendingStudent[];
}

export function ApprovalsClient({ data }: ApprovalsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleApprove(id: string) {
    startTransition(async () => {
      await approveStudent(id);
      router.refresh();
    });
  }

  function handleReject(id: string) {
    startTransition(async () => {
      await rejectStudent(id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Persetujuan Pendaftaran
        </h1>
        <p className="text-muted-foreground">
          Lihat dan setujui siswa yang menunggu aktivasi akun.
        </p>
      </div>

      {data.length === 0 ? (
        <p className="text-muted-foreground">
          Tidak ada siswa yang menunggu persetujuan.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>NISN</TableHead>
              <TableHead>Tanggal Daftar</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.nisn || "-"}</TableCell>
                <TableCell>
                  {student.createdAt?.toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleApprove(student.id)}
                    disabled={isPending}
                  >
                    Setujui
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(student.id)}
                    disabled={isPending}
                  >
                    Tolak
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
