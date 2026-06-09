"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Teacher = {
  id: string;
  name: string;
  email: string;
  roleName: string | null;
};

interface TeachersClientProps {
  data: Teacher[];
}

export function TeachersClient({ data }: TeachersClientProps) {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Guru</h1>
        <p className="text-muted-foreground">Daftar guru ter-register.</p>
      </div>

      {data.length === 0 ? (
        <p className="text-muted-foreground">Belum ada guru.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell className="font-medium">{teacher.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {teacher.email}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {teacher.roleName ?? "guru"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
