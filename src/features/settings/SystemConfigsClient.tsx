"use client";

import { Plus } from "@phosphor-icons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useState, useTransition } from "react";
import { createSystemConfig, deleteSystemConfig } from "@/actions/settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActionCell, DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ALL_SYSTEM_CONFIG_KEYS,
  SYSTEM_CONFIG_DESCRIPTIONS,
  type SystemConfigKey,
} from "@/lib/db/system-config-keys";

type SystemConfigRow = {
  id: number;
  key: string;
  value: string | null;
  description: string | null;
};

interface SystemConfigsClientProps {
  configs: SystemConfigRow[];
}

export function SystemConfigsClient({ configs }: SystemConfigsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<SystemConfigRow | null>(null);
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  const configuredKeys = new Set(configs.map((c) => c.key));
  const availableKeys = ALL_SYSTEM_CONFIG_KEYS.filter(
    (k) => !configuredKeys.has(k)
  );

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      const result = await createSystemConfig({
        key: formData.get("key") as string,
        value: formData.get("value") as string,
        description: (formData.get("description") as string) || undefined,
      });
      if ("error" in result) {
        toast({
          variant: "destructive",
          description: result.error ?? "Gagal menyimpan",
        });
        return;
      }
      setAdding(false);
      toast({ description: "Konfigurasi ditambahkan." });
    });
  }

  function handleEdit(formData: FormData) {
    if (!editing) return;
    startTransition(async () => {
      const result = await createSystemConfig({
        key: editing.key,
        value: formData.get("value") as string,
        description: (formData.get("description") as string) || undefined,
      });
      if ("error" in result) {
        toast({
          variant: "destructive",
          description: result.error ?? "Gagal menyimpan",
        });
        return;
      }
      setEditing(null);
      toast({ description: "Konfigurasi diperbarui." });
    });
  }

  function handleDelete(key: string) {
    startTransition(async () => {
      await deleteSystemConfig(key);
      toast({ description: "Konfigurasi dihapus." });
    });
  }

  const columns: ColumnDef<SystemConfigRow>[] = [
    {
      accessorKey: "key",
      header: "Key",
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          {row.original.key}
        </code>
      ),
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.value ?? (
            <Badge variant="outline" className="text-muted-foreground">
              kosong
            </Badge>
          )}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Deskripsi",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.description ?? "-"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <ActionCell
          onEdit={() => setEditing(row.original)}
          onDelete={() => handleDelete(row.original.key)}
          deleteConfirmMessage={`Hapus konfigurasi '${row.original.key}'?`}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {configs.length} konfigurasi terdaftar
        </div>
        <Dialog open={adding} onOpenChange={setAdding}>
          <DialogTrigger asChild>
            <Button disabled={availableKeys.length === 0}>
              <Plus className="h-4 w-4 mr-1" />
              Tambah Konfigurasi
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form action={handleAdd} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Tambah Konfigurasi</DialogTitle>
                <DialogDescription>
                  Pilih key dari daftar yang tersedia, lalu isi value-nya.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="add-key">Key</Label>
                <Select name="key" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih key..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableKeys.map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-value">Value</Label>
                <Input id="add-value" name="value" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-desc">Deskripsi (opsional)</Label>
                <Input id="add-desc" name="description" />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAdding(false)}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={configs}
        searchKey="key"
        searchPlaceholder="Cari konfigurasi..."
        exportFilename="system-configs"
        emptyMessage="Belum ada konfigurasi."
      />

      <Dialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
      >
        <DialogContent>
          <form action={handleEdit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Edit Konfigurasi</DialogTitle>
              <DialogDescription>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  {editing?.key}
                </code>
                {editing?.key &&
                SYSTEM_CONFIG_DESCRIPTIONS[editing.key as SystemConfigKey] ? (
                  <span className="block mt-1">
                    {SYSTEM_CONFIG_DESCRIPTIONS[editing.key as SystemConfigKey]}
                  </span>
                ) : null}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="edit-value">Value</Label>
              <Input
                id="edit-value"
                name="value"
                defaultValue={editing?.value ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Deskripsi (opsional)</Label>
              <Input
                id="edit-desc"
                name="description"
                defaultValue={editing?.description ?? ""}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(null)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
