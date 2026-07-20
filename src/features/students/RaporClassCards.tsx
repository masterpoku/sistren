"use client";

import { GraduationCap } from "@phosphor-icons/react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ClassItem = {
  id: number;
  name: string;
  code: string;
  majorName: string | null;
  capacity: number | null;
  studentCount: number;
};

export function RaporClassCards({ classList }: { classList: ClassItem[] }) {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rapor Siswa</h1>
        <p className="text-muted-foreground">
          Pilih kelas untuk melihat rapor siswa.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {classList.map((c) => (
          <Link key={c.id} href={`/students/class/${c.id}`} className="block">
            <Card className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{c.code}</CardTitle>
                  {c.capacity && (
                    <Badge variant="outline" className="text-xs">
                      {c.studentCount}/{c.capacity}
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {c.majorName ?? "Umum"} · Kelas {c.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GraduationCap className="size-4" />
                  <span>{c.studentCount} siswa</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
