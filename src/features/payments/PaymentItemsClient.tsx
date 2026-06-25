"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import {
  createPaymentItem,
  deletePaymentItem,
  updatePaymentItem,
} from "@/actions/paymentItems";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ActionCell,
  DataTable,
  formatCurrency,
  type StatusConfig,
} from "@/components/ui/data-table";
import { useActionWithToast } from "@/hooks/use-action-with-toast";
import { PaymentItemDialog } from "./PaymentItemDialog";
import { PaymentItemForm } from "./PaymentItemForm";

type PaymentItem = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  standardPrice: string;
  type: string | null;
  semesterId: number | null;
  semesterName: string | null;
  isActive: boolean | null;
};

type Semester = {
  id: number;
  name: string;
};

const TYPE_LABELS: Record<string, string> = {
  recurring: "Berulang",
  one_time: "Sekali",
  variable: "Variabel",
};

const ACTIVE_STATUS: StatusConfig = {
  label: "Aktif",
  variant: "default",
};
const INACTIVE_STATUS: StatusConfig = {
  label: "Nonaktif",
  variant: "outline",
};

interface PaymentItemsClientProps {
  items: PaymentItem[];
  semesters: Semester[];
}

function PaymentItemDeleteAction({
  id,
  router,
}: {
  id: number;
  router: ReturnType<typeof useRouter>;
}) {
  const [handleDelete] = useActionWithToast(
    async () => {
      const result = await deletePaymentItem(String(id));
      if (result && "error" in result) {
        return result;
      }
      router.refresh();
      return { success: true };
    },
    { successMessage: "Item berhasil dihapus." }
  );

  return <ActionCell onDelete={handleDelete} />;
}

export function PaymentItemsClient({
  items,
  semesters,
}: PaymentItemsClientProps) {
  const router = useRouter();

  const columns: ColumnDef<PaymentItem>[] = [
    {
      accessorKey: "code",
      header: "Kode",
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          {row.original.code}
        </code>
      ),
    },
    {
      accessorKey: "name",
      header: "Nama",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "description",
      header: "Deskripsi",
      cell: ({ row }) => (
        <span className="text-muted-foreground max-w-[200px] truncate inline-block">
          {row.original.description ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "standardPrice",
      header: "Harga Standar",
      cell: ({ row }) => (
        <span className="font-medium">
          {formatCurrency(row.original.standardPrice)}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipe",
      cell: ({ row }) => (
        <span className="text-sm">
          {TYPE_LABELS[row.original.type ?? "one_time"] ?? row.original.type}
        </span>
      ),
    },
    {
      accessorKey: "semesterName",
      header: "Semester",
      cell: ({ row }) => row.original.semesterName ?? "Semua",
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const config = row.original.isActive ? ACTIVE_STATUS : INACTIVE_STATUS;
        return (
          <span
            className={
              config.variant === "default"
                ? "inline-flex items-center rounded-full bg-green-500 px-2.5 py-0.5 text-xs font-medium text-white"
                : "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
            }
          >
            {config.label}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <PaymentItemDialog
            mode="edit"
            item={{
              id: row.original.id,
              code: row.original.code,
              name: row.original.name,
              description: row.original.description,
              standardPrice: row.original.standardPrice,
              type: row.original.type as
                | "recurring"
                | "one_time"
                | "variable"
                | null,
              semesterId: row.original.semesterId,
              isActive: row.original.isActive,
            }}
            semesters={semesters}
            createAction={createPaymentItem}
            updateAction={updatePaymentItem}
            trigger={
              <Button size="sm" variant="outline">
                Edit
              </Button>
            }
          >
            <PaymentItemForm
              item={{
                id: row.original.id,
                code: row.original.code,
                name: row.original.name,
                description: row.original.description,
                standardPrice: row.original.standardPrice,
                type: row.original.type as
                  | "recurring"
                  | "one_time"
                  | "variable"
                  | null,
                semesterId: row.original.semesterId,
                isActive: row.original.isActive,
              }}
              semesters={semesters}
            />
          </PaymentItemDialog>
          <PaymentItemDeleteAction id={row.original.id} router={router} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Daftar Item</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={items}
            searchKey="name"
            searchPlaceholder="Cari item..."
            exportFilename="payment-items"
            emptyMessage="Belum ada item pembayaran."
          />
        </CardContent>
      </Card>
    </div>
  );
}
