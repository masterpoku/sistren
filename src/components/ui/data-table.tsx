"use client";

import {
  CaretDown,
  Export,
  File,
  FileCsv,
  Pencil,
  Trash,
  Upload,
} from "@phosphor-icons/react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import Papa from "papaparse";
import * as React from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ============================================================================
// SHARED UTILITIES
// ============================================================================

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "Rp 0";
  return `Rp ${num.toLocaleString("id-ID")}`;
}

export function formatDate(
  date: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  });
}

export function formatDateTime(
  date: Date | string | null | undefined
): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================================================
// STATUS BADGE CONFIG
// ============================================================================

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline";

export interface StatusConfig {
  label: string;
  variant: BadgeVariant;
}

export const STATUS_LABELS: Record<string, StatusConfig> = {
  draft: { label: "Draft", variant: "secondary" },
  pending: { label: "Menunggu", variant: "outline" },
  paid: { label: "Lunas", variant: "default" },
  cancelled: { label: "Batal", variant: "destructive" },
  active: { label: "Aktif", variant: "default" },
  inactive: { label: "Non-aktif", variant: "destructive" },
  published: { label: "Dipublikasi", variant: "default" },
  unpublished: { label: "Draft", variant: "secondary" },
};

export const PAYMENT_TYPE_LABELS: Record<string, string> = {
  recurring: "Berulang",
  one_time: "Sekali Bayar",
  variable: "Variabel",
};

export const PAYMENT_TYPE_VARIANTS: Record<string, BadgeVariant> = {
  recurring: "secondary",
  one_time: "outline",
  variable: "default",
};

export const PRIORITY_LABELS: Record<string, StatusConfig> = {
  normal: { label: "Normal", variant: "secondary" },
  important: { label: "Penting", variant: "default" },
  urgent: { label: "Urgent", variant: "destructive" },
};

export const CATEGORY_LABELS: Record<string, string> = {
  umum: "Umum",
  akademik: "Akademik",
  keuangan: "Keuangan",
  kegiatan: "Kegiatan",
};

// ============================================================================
// ACTION CELL COMPONENT
// ============================================================================

interface ActionCellProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onCustom?: {
    label: string;
    variant?: "default" | "destructive" | "outline" | "secondary";
    onClick: () => void;
  }[];
  editLabel?: string;
  deleteLabel?: string;
  deleteConfirmMessage?: string;
}

export function ActionCell({
  onEdit,
  onDelete,
  onCustom,
  editLabel = "Edit",
  deleteLabel = "Hapus",
  deleteConfirmMessage = "Yakin hapus data ini?",
}: ActionCellProps) {
  const handleDelete = () => {
    if (confirm(deleteConfirmMessage)) {
      onDelete?.();
    }
  };

  return (
    <div className="flex items-center gap-2">
      {onEdit && (
        <Button size="sm" variant="outline" onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-1" />
          {editLabel}
        </Button>
      )}
      {onCustom?.map((action, i) => (
        <Button
          key={i}
          size="sm"
          variant={action.variant ?? "outline"}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ))}
      {onDelete && (
        <Button size="sm" variant="destructive" onClick={handleDelete}>
          <Trash className="h-4 w-4 mr-1" />
          {deleteLabel}
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// DATA TABLE COMPONENT
// ============================================================================

interface DataTableShellProps {
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DataTableShell({
  toolbar,
  footer,
  children,
  className,
}: DataTableShellProps) {
  return (
    <div className={cn("w-full space-y-4", className)}>
      {toolbar && <div className="flex items-center justify-between gap-4">{toolbar}</div>}
      <div className="rounded-md border bg-card">{children}</div>
      {footer && (
        <div className="flex items-center justify-between px-2">{footer}</div>
      )}
    </div>
  );
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  exportFilename?: string;
  onImport?: (data: unknown[]) => void;
  onRowClick?: (row: TData) => void;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
  exportFilename = "data-export",
  onImport,
  onRowClick,
  emptyMessage = "Tidak ada data.",
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const exportToExcel = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const dataToExport =
      selectedRows.length > 0
        ? selectedRows.map((row) => row.original)
        : table.getFilteredRowModel().rows.map((row) => row.original);

    const worksheet = XLSX.utils.json_to_sheet(
      dataToExport as Record<string, unknown>[]
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${exportFilename}.xlsx`);
  };

  const exportToCSV = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const dataToExport =
      selectedRows.length > 0
        ? selectedRows.map((row) => row.original)
        : table.getFilteredRowModel().rows.map((row) => row.original);

    const csv = Papa.unparse(dataToExport as Record<string, unknown>[]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${exportFilename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onImport) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (file.name.endsWith(".csv")) {
        Papa.parse(content as string, {
          header: true,
          complete: (results) => onImport(results.data),
        });
      } else {
        const workbook = XLSX.read(content, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        onImport(json);
      }
    };
    if (file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const toolbar = (
    <>
      <div className="flex flex-1 items-center gap-2">
        {searchKey && (
          <Input
            placeholder={searchPlaceholder ?? `Cari ${searchKey}...`}
            value={
              (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          className="hidden"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Export className="mr-2 h-4 w-4" />
              Data <CaretDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportToExcel} className="cursor-pointer">
              <File className="mr-2 h-4 w-4 text-green-600" weight="fill" />
              Export Excel (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer">
              <FileCsv className="mr-2 h-4 w-4 text-blue-600" weight="fill" />
              Export CSV (.csv)
            </DropdownMenuItem>
            {onImport && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer"
                >
                  <Upload className="mr-2 h-4 w-4 text-purple-600" />
                  Import Data
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Kolom <CaretDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  const footer = (
    <>
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <span>
            {table.getFilteredSelectedRowModel().rows.length} dari{" "}
            {table.getFilteredRowModel().rows.length} baris dipilih.
          </span>
        )}
        {table.getFilteredSelectedRowModel().rows.length === 0 && (
          <span>
            {table.getFilteredRowModel().rows.length} baris total.
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Selanjutnya
        </Button>
      </div>
    </>
  );

  return (
    <DataTableShell toolbar={toolbar} footer={footer}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Memuat...
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={onRowClick ? "cursor-pointer" : undefined}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
