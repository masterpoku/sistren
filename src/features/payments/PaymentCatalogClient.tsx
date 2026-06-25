"use client";

import { Pencil, Trash } from "@phosphor-icons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  createPaymentItem,
  deletePaymentItem,
  updatePaymentItem,
} from "@/actions/paymentItems";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type BadgeVariant,
  DataTable,
  formatCurrency,
  PAYMENT_TYPE_LABELS,
  PAYMENT_TYPE_VARIANTS,
} from "@/components/ui/data-table";
import { PaymentItemDialog } from "@/features/payments/PaymentItemDialog";
import { PaymentItemForm } from "@/features/payments/PaymentItemForm";
import { useToast } from "@/hooks/use-toast";

export interface PaymentCatalogItem {
  id: number;
  code: string;
  name: string;
  description: string | null;
  standardPrice: string;
  type: "recurring" | "one_time" | "variable" | null;
  semesterName: string | null;
  isActive: boolean | null;
  semesterId: number | null;
}

type Semester = { id: number; name: string };

interface PaymentCatalogClientProps {
  items: PaymentCatalogItem[];
  semesters: Semester[];
  canManage: boolean;
}

export function PaymentCatalogClient({
  items,
  semesters,
  canManage,
}: PaymentCatalogClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: number) {
    startTransition(async () => {
      const result = await deletePaymentItem(String(id));
      if (result && "error" in result) {
        toast({ variant: "destructive", description: result.error });
      } else {
        toast({ description: "Item berhasil dihapus." });
        router.refresh();
      }
    });
  }

  const columns: ColumnDef<PaymentCatalogItem>[] = [
    {
      accessorKey: "code",
      header: "Kode",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.getValue("code")}</span>
      ),
    },
    { accessorKey: "name", header: "Nama" },
    {
      accessorKey: "description",
      header: "Deskripsi",
      cell: ({ row }) => row.getValue("description") ?? "-",
    },
    {
      accessorKey: "type",
      header: "Tipe",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        if (!type) return "-";
        return (
          <Badge variant={PAYMENT_TYPE_VARIANTS[type] as BadgeVariant}>
            {PAYMENT_TYPE_LABELS[type]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "semesterName",
      header: "Semester",
      cell: ({ row }) => row.getValue("semesterName") ?? "-",
    },
    {
      accessorKey: "standardPrice",
      header: "Harga",
      cell: ({ row }) => (
        <span className="font-medium">
          {formatCurrency(row.getValue("standardPrice"))}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive === false ? "destructive" : "default"}>
            {isActive === false ? "Non-aktif" : "Aktif"}
          </Badge>
        );
      },
    },
    ...(canManage
      ? [
          {
            id: "actions",
            header: "Aksi",
            cell: ({ row }: { row: { original: PaymentCatalogItem } }) => (
              <div className="flex items-center gap-1">
                <PaymentItemDialog
                  mode="edit"
                  item={row.original}
                  semesters={semesters}
                  createAction={createPaymentItem}
                  updateAction={updatePaymentItem}
                  trigger={
                    <Button size="sm" variant="ghost">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  }
                >
                  <PaymentItemForm item={row.original} semesters={semesters} />
                </PaymentItemDialog>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(row.original.id)}
                  disabled={isPending}
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      {canManage && (
        <div className="flex justify-end">
          <PaymentItemDialog
            mode="create"
            semesters={semesters}
            createAction={createPaymentItem}
            updateAction={updatePaymentItem}
            trigger={<Button>+ Tambah Item</Button>}
          >
            <PaymentItemForm semesters={semesters} />
          </PaymentItemDialog>
        </div>
      )}

      <DataTable
        columns={columns}
        data={items}
        searchKey="name"
        searchPlaceholder="Cari item..."
        exportFilename="katalog-pembayaran"
        emptyMessage="Belum ada item pembayaran tersedia."
      />
    </div>
  );
}
