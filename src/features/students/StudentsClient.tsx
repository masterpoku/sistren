"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Student = {
  id: string;
  name: string;
  email: string;
  nisn: string | null;
};

interface StudentsClientProps {
  data: Student[];
}

export function StudentsClient({ data }: StudentsClientProps) {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Siswa</h1>
        <p className="text-muted-foreground">Daftar siswa ter-register.</p>
      </div>

      {data.length === 0 ? (
        <p className="text-muted-foreground">Belum ada siswa.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>NISN</TableHead>
              <TableHead>Dokumen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {student.email}
                </TableCell>
                <TableCell>{student.nisn ?? "-"}</TableCell>
                <TableCell>
                  <Link href={`/students/${student.id}/documents`}>
                    <Button size="sm" variant="outline">
                      Dokumen
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
