"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type PaymentItem = {
  id?: number;
  code: string;
  name: string;
  description: string | null;
  standardPrice: string;
  type: "recurring" | "one_time" | "variable" | null;
  semesterId: number | null;
  isActive: boolean | null;
};

type Semester = {
  id: number;
  name: string;
};

type Props = {
  item?: PaymentItem;
  semesters: Semester[];
};

export function PaymentItemForm({ item, semesters }: Props) {
  const [semesterValue, setSemesterValue] = useState(
    item?.semesterId ? String(item.semesterId) : "__none__"
  );

  return (
    <div className="grid gap-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Kode</Label>
          <Input
            id="code"
            name="code"
            placeholder="SPP-01"
            defaultValue={item?.code ?? ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipe</Label>
          <Select name="type" defaultValue={item?.type ?? "one_time"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one_time">Sekali</SelectItem>
              <SelectItem value="recurring">Berulang</SelectItem>
              <SelectItem value="variable">Variabel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nama Item</Label>
        <Input
          id="name"
          name="name"
          placeholder="SPP Bulanan"
          defaultValue={item?.name ?? ""}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Input
          id="description"
          name="description"
          placeholder="Tagihan bulanan siswa"
          defaultValue={item?.description ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="standardPrice">Harga Standar (Rp)</Label>
          <Input
            id="standardPrice"
            name="standardPrice"
            type="number"
            step="1000"
            min="0"
            placeholder="150000"
            defaultValue={item?.standardPrice ?? ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="semesterId">Semester (opsional)</Label>
          <Select
            name="semesterId"
            value={semesterValue}
            onValueChange={setSemesterValue}
          >
            <SelectTrigger>
              <SelectValue placeholder="Semua semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Semua semester</SelectItem>
              {semesters.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="isActive"
          name="isActive"
          defaultChecked={item?.isActive ?? true}
        />
        <Label htmlFor="isActive">Item aktif</Label>
        <input type="hidden" name="isActive" value="false" />
      </div>
    </div>
  );
}
