import { getSemesters } from "@/actions/academic";
import {
  createPaymentItem,
  deletePaymentItem,
  getPaymentItems,
  updatePaymentItem,
} from "@/actions/paymentItems";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentItemDialog } from "@/features/payments/PaymentItemDialog";
import { PaymentItemForm } from "@/features/payments/PaymentItemForm";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

const TYPE_LABELS: Record<string, string> = {
  recurring: "Berulang",
  one_time: "Sekali",
  variable: "Variabel",
};

export default async function AdminPaymentItemsPage() {
  await verifyRoleLevel(80);

  const [items, semesters] = await Promise.all([
    getPaymentItems(),
    getSemesters(),
  ]);

  const typeLabel = (t: string | null | undefined) =>
    TYPE_LABELS[t ?? "one_time"] ?? t ?? "—";

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Item Pembayaran</h1>
          <p className="text-muted-foreground">
            Katalog item tagihan — SPP, uang gedung, dll.
          </p>
        </div>
        <PaymentItemDialog
          mode="create"
          semesters={semesters}
          createAction={createPaymentItem}
          updateAction={updatePaymentItem}
          trigger={<Button>+ Tambah Item</Button>}
        >
          <PaymentItemForm semesters={semesters} />
        </PaymentItemDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Item</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center">
              Belum ada item pembayaran.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Harga Standar</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">
                      {item.code}
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">
                      {item.description ?? "—"}
                    </TableCell>
                    <TableCell className="font-medium">
                      Rp {Number(item.standardPrice).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{typeLabel(item.type)}</Badge>
                    </TableCell>
                    <TableCell>{item.semesterName ?? "Semua"}</TableCell>
                    <TableCell>
                      {item.isActive ? (
                        <Badge variant="default" className="bg-green-500">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge variant="outline">Nonaktif</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <PaymentItemDialog
                          mode="edit"
                          item={item}
                          semesters={semesters}
                          createAction={createPaymentItem}
                          updateAction={updatePaymentItem}
                          trigger={
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          }
                        >
                          <PaymentItemForm item={item} semesters={semesters} />
                        </PaymentItemDialog>
                        <form
                          action={async () => {
                            "use server";
                            await deletePaymentItem(String(item.id));
                          }}
                        >
                          <Button size="sm" variant="destructive" type="submit">
                            Hapus
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
