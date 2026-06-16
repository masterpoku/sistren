"use client";

import { CheckCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";

interface BoardingClientProps {
  email: string;
  name: string;
}

export function BoardingClient({ email, name }: BoardingClientProps) {
  return (
    <PageShell
      title="Pendaftaran Berhasil"
      description="Akun Anda telah terdaftar di sistem."
    >
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle
              className="h-6 w-6 text-green-600"
              weight="fill"
              aria-hidden
            />
            <CardTitle>Selamat datang, {name}</CardTitle>
          </div>
          <CardDescription>
            Akun Anda sudah tercatat. Tunggu persetujuan administrator untuk
            dapat login.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Email Terdaftar</p>
            <p className="rounded-md border bg-muted/50 px-3 py-2 font-mono text-sm">
              {email}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Cara Login Pertama Kali</p>
            <p className="text-sm text-muted-foreground">
              Gunakan NISN Anda sebagai kata sandi untuk login pertama kali.
              Segera ganti kata sandi setelah masuk.
            </p>
          </div>
          <div className="pt-2">
            <Button asChild>
              <Link href="/login">Kembali ke Halaman Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
