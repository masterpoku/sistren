"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createPaymentMethod, deletePaymentMethod } from "@/actions/payments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PaymentMethod = {
  id: number;
  name: string;
  provider: string | null;
  accountNumber: string | null;
  accountName: string | null;
};

interface PaymentMethodsClientProps {
  data: PaymentMethod[];
}

export function PaymentMethodsClient({ data }: PaymentMethodsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createPaymentMethod(formData);
      if (result && "error" in result) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      await deletePaymentMethod(String(id));
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Metode Pembayaran</h1>
        <p className="text-muted-foreground">
          Kelola metode pembayaran (transfer, cash, e-wallet).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Metode</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={handleCreate}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nama Metode</Label>
              <Input id="name" name="name" placeholder="Bank BCA" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Nomor Rekening</Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                placeholder="1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountName">Nama Pemilik</Label>
              <Input
                id="accountName"
                name="accountName"
                placeholder="SMK Terpadu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Input id="provider" name="provider" placeholder="Bank BCA" />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Menyimpan..." : "Tambah"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {data.length === 0 ? (
        <p className="text-muted-foreground">Belum ada metode pembayaran.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Nomor Rekening</TableHead>
              <TableHead>Nama Pemilik</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>{m.provider ?? "-"}</TableCell>
                <TableCell>{m.accountNumber ?? "-"}</TableCell>
                <TableCell>{m.accountName ?? "-"}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(m.id)}
                    disabled={isPending}
                  >
                    Hapus
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
