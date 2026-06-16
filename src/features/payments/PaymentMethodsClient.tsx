"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ActionCell } from "@/components/ui/data-table";
import { PageShell } from "@/components/ui/page-shell";
import { useToast } from "@/hooks/use-toast";
import { PaymentMethodDialog } from "@/features/payments/PaymentMethodDialog";

type PaymentMethod = {
    id: number;
    name: string;
    provider: string | null;
    accountNumber: string | null;
    accountName: string | null;
    instructions: string | null;
};

interface PaymentMethodsClientProps {
    data: PaymentMethod[];
}

function PaymentMethodActions({ item }: { item: PaymentMethod }) {
    const { toast } = useToast();

    async function handleDelete() {
        const { deletePaymentMethod } = await import("@/actions/payments");
        const result = await deletePaymentMethod(String(item.id));
        if (result && "error" in result && result.error) {
            toast({ variant: "destructive", description: result.error });
            return;
        }
        toast({ description: "Metode dihapus." });
    }

    return (
        <div className="flex items-center gap-2">
            <PaymentMethodDialog
                item={{
                    id: item.id,
                    name: item.name,
                    accountNumber: item.accountNumber,
                    accountName: item.accountName,
                    provider: item.provider,
                    instructions: item.instructions,
                }}
                trigger={
                    <Button type="button" variant="outline" size="sm">
                        Edit
                    </Button>
                }
            />
            <ActionCell onDelete={handleDelete} />
        </div>
    );
}

export function PaymentMethodsClient({ data }: PaymentMethodsClientProps) {
    const columns: ColumnDef<PaymentMethod>[] = [
        {
            accessorKey: "name",
            header: "Nama",
        },
        {
            accessorKey: "provider",
            header: "Provider",
            cell: ({ row }) => row.getValue("provider") ?? "-",
        },
        {
            accessorKey: "accountNumber",
            header: "Nomor Rekening",
            cell: ({ row }) => row.getValue("accountNumber") ?? "-",
        },
        {
            accessorKey: "accountName",
            header: "Nama Pemilik",
            cell: ({ row }) => row.getValue("accountName") ?? "-",
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => <PaymentMethodActions item={row.original} />,
        },
    ];

    return (
        <PageShell
            title="Metode Pembayaran"
            description="Kelola metode pembayaran (transfer, cash, e-wallet)."
            actions={
                <PaymentMethodDialog
                    trigger={<Button type="button">Tambah Metode</Button>}
                />
            }
        >
            <DataTable
                columns={columns}
                data={data}
                searchKey="name"
                searchPlaceholder="Cari metode..."
                exportFilename="metode-pembayaran"
                emptyMessage="Belum ada metode pembayaran."
            />
        </PageShell>
    );
}
