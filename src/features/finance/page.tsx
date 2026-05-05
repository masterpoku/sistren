'use client'

import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { fetchPayments } from '@/actions/payments'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DotsThree, Eye, Pencil, Trash, Plus } from 'phosphor-react'

interface Payment {
  id: number
  studentId: number
  code: string
  description: string
  price: string
  quantity: number | null
  total: string
  orderData: unknown
  status: 'draft' | 'pending' | 'paid' | 'cancelled' | null
  paidAt: Date | null
  createdAt: Date | null
}

const formatCurrency = (amount: string) => {
  const num = parseFloat(amount)
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num)
}

export const columns: ColumnDef<Payment>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Pilih semua"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Pilih baris"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'studentId',
    header: 'ID Siswa',
  },
  {
    accessorKey: 'description',
    header: 'Deskripsi',
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => formatCurrency(row.getValue('total')),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge
          variant={
            status === 'paid'
              ? 'default'
              : status === 'pending'
                ? 'destructive'
                : 'secondary'
          }
          className="capitalize"
        >
          {status || 'draft'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'code',
    header: 'Kode',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const payment = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Buka menu</span>
              <DotsThree className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(String(payment.id))}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" /> Lihat Detail
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Pencil className="mr-2 h-4 w-4" /> Edit Data
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-destructive">
              <Trash className="mr-2 h-4 w-4" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function FinancePage() {
  const [payments, setPayments] = React.useState<Payment[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadPayments() {
      try {
        const data = await fetchPayments()
        setPayments(data)
      } catch (error) {
        console.error('Failed to fetch payments:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPayments()
  }, [])

  const paidPayments = payments.filter((p) => p.status === 'paid')
  const pendingPayments = payments.filter((p) => p.status === 'pending')
  const draftPayments = payments.filter((p) => p.status === 'draft')
  const totalPaidAmount = paidPayments.reduce((sum, p) => sum + parseFloat(p.total || '0'), 0)

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Keuangan</h1>
          <p className="text-muted-foreground">
            Manajemen pembayaran siswa SMK TERPADU.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Pembayaran
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border bg-card p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-12" />
              </div>
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border bg-card p-6">
              <div className="text-sm font-medium text-muted-foreground">Lunas</div>
              <div className="text-2xl font-bold">{paidPayments.length}</div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="text-sm font-medium text-muted-foreground">
                Pending
              </div>
              <div className="text-2xl font-bold">{pendingPayments.length}</div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="text-sm font-medium text-muted-foreground">
                Draft
              </div>
              <div className="text-2xl font-bold">{draftPayments.length}</div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="text-sm font-medium text-muted-foreground">
                Total Pendapatan
              </div>
              <div className="text-2xl font-bold">{formatCurrency(String(totalPaidAmount))}</div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={payments}
            searchKey="description"
            exportFilename="data-pembayaran-sistren"
          />
        </>
      )}
    </div>
  )
}