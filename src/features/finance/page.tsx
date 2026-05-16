'use client'

import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { fetchPayments, createPaymentRecord, updatePaymentRecord, markPaymentAsPaidAction, cancelPaymentAction, deletePaymentAction } from '@/actions/payments'
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
import { DotsThree, Eye, Pencil, Trash, Plus, CheckCircle, Prohibit } from 'phosphor-react'
import { PaymentForm, PaymentFormData } from '@/components/finance/PaymentForm'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useToast } from '@/hooks/use-toast'

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

export default function FinancePage() {
  const [payments, setPayments] = React.useState<Payment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingPayment, setEditingPayment] = React.useState<Payment | null>(null)
  const { toast } = useToast()

  const loadPayments = React.useCallback(async () => {
    try {
      const data = await fetchPayments()
      setPayments(data)
    } catch (error) {
      console.error('Failed to fetch payments:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data pembayaran',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    loadPayments()
  }, [loadPayments])

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment)
    setFormOpen(true)
  }

  const handleMarkAsPaid = async (id: number) => {
    if (!window.confirm('Tandai pembayaran ini sebagai LUNAS?')) return
    try {
      await markPaymentAsPaidAction(id)
      toast({ title: 'Berhasil', description: 'Pembayaran ditandai lunas' })
      await loadPayments()
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal memperbarui status', variant: 'destructive' })
    }
  }

  const handleCancel = async (id: number) => {
    if (!window.confirm('Batalkan pembayaran ini?')) return
    try {
      await cancelPaymentAction(id)
      toast({ title: 'Berhasil', description: 'Pembayaran dibatalkan' })
      await loadPayments()
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal membatalkan', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus pembayaran ini? Data tidak bisa dikembalikan.')) return
    try {
      await deletePaymentAction(id)
      toast({ title: 'Berhasil', description: 'Pembayaran berhasil dihapus' })
      await loadPayments()
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menghapus', variant: 'destructive' })
    }
  }

  const handleSubmit = async (data: PaymentFormData) => {
    try {
      if (editingPayment) {
        await updatePaymentRecord({
          id: editingPayment.id,
          description: data.description,
          price: parseFloat(data.price),
          quantity: data.quantity,
        })
        toast({ title: 'Berhasil', description: 'Pembayaran berhasil diperbarui' })
      } else {
        await createPaymentRecord({
          studentId: data.studentId,
          description: data.description,
          price: parseFloat(data.price),
          quantity: data.quantity,
        })
        toast({ title: 'Berhasil', description: 'Pembayaran berhasil dicatat' })
      }
      setFormOpen(false)
      setEditingPayment(null)
      await loadPayments()
    } catch (error) {
      toast({
        title: 'Error',
        description: editingPayment ? 'Gagal memperbarui pembayaran' : 'Gagal mencatat pembayaran',
        variant: 'destructive',
      })
    }
  }

  const columns = React.useMemo(
    () => buildColumns(handleEdit, handleMarkAsPaid, handleCancel, handleDelete),
    [handleEdit, handleMarkAsPaid, handleCancel, handleDelete]
  )

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
        <RequirePermission permission="payments.create">
          <Button className="gap-2" onClick={() => { setEditingPayment(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" />
            Tambah Pembayaran
          </Button>
        </RequirePermission>
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
              <div className="text-sm font-medium text-muted-foreground">Pending</div>
              <div className="text-2xl font-bold">{pendingPayments.length}</div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="text-sm font-medium text-muted-foreground">Draft</div>
              <div className="text-2xl font-bold">{draftPayments.length}</div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="text-sm font-medium text-muted-foreground">Total Pendapatan</div>
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

      <PaymentForm
        key={editingPayment?.id || 'new'}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setTimeout(() => setEditingPayment(null), 200)
        }}
        onSubmit={handleSubmit}
        initialData={editingPayment ? {
          studentId: editingPayment.studentId,
          description: editingPayment.description,
          price: editingPayment.price,
          quantity: editingPayment.quantity || 1,
          total: editingPayment.total,
        } : undefined}
      />
    </div>
  )
}

function buildColumns(
  onEdit: (payment: Payment) => void,
  onMarkAsPaid: (id: number) => void,
  onCancel: (id: number) => void,
  onDelete: (id: number) => void
): ColumnDef<Payment>[] {
  return [
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
        const isPaid = payment.status === 'paid'
        const isDraft = payment.status === 'draft'

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(payment.id))} className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" /> Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {!isPaid && (
                <RequirePermission permission="payments.approve">
                  <DropdownMenuItem onClick={() => onMarkAsPaid(payment.id)} className="cursor-pointer">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Tandai Lunas
                  </DropdownMenuItem>
                </RequirePermission>
              )}
              {!isPaid && (
                <RequirePermission permission="payments.update">
                  <DropdownMenuItem onClick={() => onCancel(payment.id)} className="cursor-pointer">
                    <Prohibit className="mr-2 h-4 w-4 text-orange-600" /> Batalkan
                  </DropdownMenuItem>
                </RequirePermission>
              )}
              {isDraft && (
                <RequirePermission permission="payments.update">
                  <DropdownMenuItem onClick={() => onEdit(payment)} className="cursor-pointer">
                    <Pencil className="mr-2 h-4 w-4" /> Edit Data
                  </DropdownMenuItem>
                </RequirePermission>
              )}
              <RequirePermission permission="payments.delete">
                <DropdownMenuItem onClick={() => onDelete(payment.id)} className="cursor-pointer text-destructive">
                  <Trash className="mr-2 h-4 w-4" /> Hapus
                </DropdownMenuItem>
              </RequirePermission>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
