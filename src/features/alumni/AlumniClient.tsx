"use client";

import { User } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AlumniItem {
  id: string;
  name: string;
  email: string;
  nisn: string | null;
  enrollmentStatus: string | null;
}

interface AlumniClientProps {
  data: AlumniItem[];
}

export function AlumniClient({ data }: AlumniClientProps) {
  if (data.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Belum ada alumni.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((a) => (
        <Card key={a.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                  <User className="h-4 w-4 text-yellow-700" />
                </div>
                <div>
                  <CardTitle className="text-sm">{a.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {a.email}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{a.nisn ? `NISN: ${a.nisn}` : "-"}</span>
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-700 border-yellow-200"
              >
                Alumni
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
