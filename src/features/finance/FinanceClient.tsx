"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import {
    STATUS_LABELS,
    formatCurrency,
    type StatusConfig,
} from "@/components/ui/data-table";
import { PageShell } from "@/components/ui/page-shell";
import { useToast } from "@/hooks/use-toast";
import { RecordPaymentDialog } from "@/features/finance/RecordPaymentDialog";

type PaymentRow = {
    id: number;
    studentId: string;
    studentName: string | null;
    code: string;
    description: string;
    price: string;
    total: string;
    status: string | null;
};

function ConfirmButton({ id }: { id: number }) {
    const { toast } = useToast();

    async function handleConfirm() {
        const result = await import("@/actions/payments").then((m) =>
            m.confirmPayment(String(id))
        );
        if (result && "error" in result && result.error) {
            toast({ variant: "destructive", description: result.error });
            return;
        }
        toast({ description: "Pembayaran dikonfirmasi." });
    }

    return (
        <Button size="sm" onClick={handleConfirm}>
            Konfirmasi
        </Button>
    );
}

interface FinanceClientProps {
    paymentList: PaymentRow[];
    studentRows: Array<{ id: string; name: string; email: string }>;
    catalogItems: Array<{
        id: number;
        code: string;
        name: string;
        description: string | null;
        standardPrice: string;
    }>;
    recordPayment: (
        formData: FormData
    ) => Promise<{ error?: string } | { success: boolean }>;
}

export function FinanceClient({
    paymentList,
    studentRows,
    catalogItems,
    recordPayment,
}: FinanceClientProps) {
    const columns: ColumnDef<PaymentRow>[] = [
        {
            accessorKey: "studentName",
            header: "Siswa",
            cell: ({ row }) => row.original.studentName ?? row.original.studentId,
        },
        {
            accessorKey: "code",
            header: "Kode",
            cell: ({ row }) => (
                <span className="font-mono text-sm">{row.getValue("code")}</span>
            ),
        },
        {
            accessorKey: "description",
            header: "Deskripsi",
        },
        {
            accessorKey: "total",
            header: "Jumlah",
            cell: ({ row }) => (
                <span className="font-medium">
                    {formatCurrency(row.getValue("total"))}
                </span>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                const config: StatusConfig =
                    STATUS_LABELS[status ?? "draft"] ?? STATUS_LABELS.draft;
                return <Badge variant={config.variant}>{config.label}</Badge>;
            },
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) =>
                row.original.status === "pending" ? (
                    <ConfirmButton id={row.original.id} />
                ) : null,
        },
    ];

    return (
        <PageShell
            title="Keuangan"
            description="Kelola pembayaran siswa."
            actions={
                <RecordPaymentDialog
                    students={studentRows}
                    paymentItems={catalogItems}
                    recordAction={recordPayment}
                    trigger={<Button type="button">Catat Pembayaran</Button>}
                />
            }
        >
            <DataTable
                columns={columns}
                data={paymentList}
                searchKey="studentName"
                searchPlaceholder="Cari siswa..."
                exportFilename="pembayaran"
                emptyMessage="Belum ada data pembayaran."
            />
        </PageShell>
    );
}
