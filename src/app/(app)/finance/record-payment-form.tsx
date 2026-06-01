'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Student = {
  id: string;
  name: string;
  email: string;
};

type PaymentItem = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  standardPrice: string;
};

type Props = {
  students: Student[];
  paymentItems: PaymentItem[];
  recordAction: (
    formData: FormData
  ) => Promise<{ error?: string } | { success: boolean }>;
};

export function RecordPaymentForm({
  students,
  paymentItems,
  recordAction,
}: Props) {
  function handleItemChange(itemId: string) {
    if (!itemId) return;
    const item = paymentItems.find((i) => i.id === Number(itemId));
    if (!item) return;
    const descInput = document.getElementById(
      'description'
    ) as HTMLInputElement;
    const priceInput = document.getElementById('price') as HTMLInputElement;
    if (descInput) descInput.value = item.description ?? item.name;
    if (priceInput) priceInput.value = item.standardPrice;
  }

  async function handleSubmit(formData: FormData) {
    const result = await recordAction(formData);
    if (result && 'error' in result) {
      throw new Error(result.error);
    }
  }

  return (
    <form
      action={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
    >
      <div className="space-y-2">
        <Label htmlFor="studentId">Siswa</Label>
        <select
          id="studentId"
          name="studentId"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        >
          <option value="">Pilih siswa</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.email})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentItemId">Item (opsional)</Label>
        <select
          id="paymentItemId"
          name="paymentItemId"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          onChange={(e) => handleItemChange(e.target.value)}
        >
          <option value="">— Pilih item —</option>
          {paymentItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.code} — {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Input
          id="description"
          name="description"
          placeholder="SPP Bulan Juli 2025"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Jumlah (Rp)</Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="1000"
          placeholder="150000"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Jumlah Bulan</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          defaultValue="1"
          min="1"
        />
      </div>

      <div className="lg:col-span-5 flex items-end">
        <Button type="submit" className="w-full sm:w-auto">
          Catat Pembayaran
        </Button>
      </div>
    </form>
  );
}
