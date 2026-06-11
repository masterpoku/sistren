"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export interface PaymentCatalogItem {
  id: number;
  code: string;
  name: string;
  description: string | null;
  standardPrice: string;
  type: "recurring" | "one_time" | "variable" | null;
  semesterName: string | null;
  isActive: boolean | null;
}

const TYPE_VARIANTS: Record<
  NonNullable<PaymentCatalogItem["type"]>,
  "default" | "secondary" | "outline"
> = {
  recurring: "secondary",
  one_time: "outline",
  variable: "default",
};

const TYPE_LABELS: Record<NonNullable<PaymentCatalogItem["type"]>, string> = {
  recurring: "Berulang",
  one_time: "Sekali Bayar",
  variable: "Variabel",
};

interface PaymentCatalogClientProps {
  items: PaymentCatalogItem[];
}

export function PaymentCatalogClient({ items }: PaymentCatalogClientProps) {
  if (items.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Katalog Pembayaran
        </h1>
        <p className="text-muted-foreground">
          Daftar item pembayaran yang tersedia di sekolah.
        </p>
        <EmptyState
          icon="inbox"
          title="Belum ada item pembayaran tersedia"
          description="Item pembayaran akan ditampilkan di sini setelah admin menambahkannya."
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold tracking-tight">Katalog Pembayaran</h1>
      <p className="text-muted-foreground">
        Daftar item pembayaran yang tersedia di sekolah.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <code className="text-xs text-muted-foreground font-mono">
                {item.code}
              </code>
              <CardTitle className="text-base">{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.description && (
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {item.type && (
                  <Badge variant={TYPE_VARIANTS[item.type]}>
                    {TYPE_LABELS[item.type]}
                  </Badge>
                )}
                {item.semesterName && (
                  <Badge variant="outline">{item.semesterName}</Badge>
                )}
                <Badge
                  variant={item.isActive === false ? "destructive" : "default"}
                >
                  {item.isActive === false ? "Non-aktif" : "Aktif"}
                </Badge>
              </div>
              <p className="text-lg font-semibold">
                Rp {Number(item.standardPrice).toLocaleString("id-ID")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
