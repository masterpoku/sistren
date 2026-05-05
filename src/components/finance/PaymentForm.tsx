'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface PaymentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: PaymentFormData) => void
}

export interface PaymentFormData {
  studentId: number
  description: string
  price: string
  quantity: number
  total: string
}

export function PaymentForm({ open, onOpenChange, onSubmit }: PaymentFormProps) {
  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState<PaymentFormData>({
    studentId: 0,
    description: '',
    price: '',
    quantity: 1,
    total: '',
  })

  const handlePriceChange = (price: string) => {
    const numPrice = parseFloat(price) || 0
    const total = (numPrice * formData.quantity).toFixed(2)
    setFormData({ ...formData, price, total })
  }

  const handleQuantityChange = (quantity: number) => {
    const numPrice = parseFloat(formData.price) || 0
    const total = (numPrice * quantity).toFixed(2)
    setFormData({ ...formData, quantity, total })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
      onOpenChange(false)
      setFormData({
        studentId: 0,
        description: '',
        price: '',
        quantity: 1,
        total: '',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Pembayaran</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="studentId">ID Siswa</label>
            <input
              id="studentId"
              type="number"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.studentId || ''}
              onChange={(e) => setFormData({ ...formData, studentId: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="description">Deskripsi</label>
            <input
              id="description"
              placeholder="SPP Bulan April 2026"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="price">Harga per Unit</label>
              <input
                id="price"
                type="number"
                step="0.01"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.price}
                onChange={(e) => handlePriceChange(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="quantity">Jumlah</label>
              <input
                id="quantity"
                type="number"
                min="1"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="total">Total</label>
            <input
              id="total"
              disabled
              className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
              value={`Rp ${parseFloat(formData.total || '0').toLocaleString('id-ID')}`}
            />
          </div>
          <DialogFooter>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-slate-100 hover:text-slate-900 h-10 px-4 py-2"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}