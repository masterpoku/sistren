"use client";

import { useRef } from "react";
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
    const descRef = useRef<HTMLInputElement>(null);
    const priceRef = useRef<HTMLInputElement>(null);

    function handleItemChange(itemId: string) {
        if (!itemId) return;
        const item = paymentItems.find((i) => i.id === Number(itemId));
        if (!item) return;
        if (descRef.current) descRef.current.value = item.description ?? item.name;
        if (priceRef.current) priceRef.current.value = item.standardPrice;
    }

    async function handleSubmit(formData: FormData) {
        await recordAction(formData);
    }

    return (
        <form
            action={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
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
                <Select name="paymentItemId" onValueChange={handleItemChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih item" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">— Pilih item —</SelectItem>
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
                    ref={descRef}
                    placeholder="SPP Bulan Juli 2025"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="price">Jumlah (Rp)</Label>
                <Input
                    id="price"
                    name="price"
                    ref={priceRef}
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
