"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [itemValue, setItemValue] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  function handleItemChange(itemId: string) {
    setItemValue(itemId);
    if (!itemId) {
      setDescription("");
      setPrice("");
      return;
    }
    const item = paymentItems.find((i) => i.id === Number(itemId));
    if (!item) return;
    setDescription(item.description ?? item.name);
    setPrice(item.standardPrice);
  }

  async function handleSubmit(formData: FormData) {
    await recordAction(formData);
  }

  return (
    <form action={handleSubmit} className="grid gap-3">
      <div className="space-y-2">
        <Label htmlFor="studentId">Siswa</Label>
        <Select name="studentId" required>
          <SelectTrigger>
            <SelectValue placeholder="Pilih siswa" />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} ({s.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentItemId">Item (opsional)</Label>
        <Select
          name="paymentItemId"
          value={itemValue}
          onValueChange={handleItemChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih item" />
          </SelectTrigger>
          <SelectContent>
            {paymentItems.map((item) => (
              <SelectItem key={item.id} value={String(item.id)}>
                {item.code} — {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Input
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="SPP Bulan Juli 2025"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="price">Jumlah (Rp)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="1000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
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
      </div>

      <Button type="submit">Catat Pembayaran</Button>
    </form>
  );
}
