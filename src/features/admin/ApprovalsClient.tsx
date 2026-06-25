"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ActionCell, DataTable, formatDate } from "@/components/ui/data-table";
import { useActionWithToast } from "@/hooks/use-action-with-toast";

type PendingStudent = {
  id: string;
  name: string;
  email: string;
  createdAt: Date | null;
  nisn: string | null;
};

export const columns: ColumnDef<PendingStudent>[] = [
  {
    accessorKey: "name",
    header: "Nama",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "nisn",
    header: "NISN",
    cell: ({ row }) => row.getValue("nisn") || "-",
  },
  {
    accessorKey: "createdAt",
    header: "Tanggal Daftar",
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => <ApprovalActions id={row.original.id} />,
  },
];

interface ApprovalsClientProps {
  data: PendingStudent[];
}

export function ApprovalsClient({ data }: ApprovalsClientProps) {
  return (
    <div className="flex flex-col gap-6">
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Cari nama..."
        exportFilename="persetujuan"
        emptyMessage="Tidak ada siswa yang menunggu persetujuan."
      />
    </div>
  );
}

function ApproveAction({ id }: { id: string }) {
  const [handleApprove] = useActionWithToast(
    async () => {
      const { approveStudent } = await import("@/actions/admin");
      return await approveStudent(id);
    },
    { successMessage: "Siswa disetujui." }
  );
  return {
    label: "Setujui",
    variant: "default" as const,
    onClick: handleApprove,
  };
}

function RejectAction({ id }: { id: string }) {
  const [handleReject] = useActionWithToast(
    async () => {
      const { rejectStudent } = await import("@/actions/admin");
      return await rejectStudent(id);
    },
    { successMessage: "Siswa ditolak." }
  );
  return {
    label: "Tolak",
    variant: "destructive" as const,
    onClick: handleReject,
  };
}

function ApprovalActions({ id }: { id: string }) {
  const approve = ApproveAction({ id });
  const reject = RejectAction({ id });
  return <ActionCell onCustom={[approve, reject]} />;
}
