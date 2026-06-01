import { getPayments, confirmPayment, recordPayment } from '@/actions/payments';
import { verifyRoleLevel } from '@/lib/auth/verify-session';
import { db } from '@/lib/db';
import { users, roles, paymentItems } from '@/lib/db/schema';
import { eq, isNull, and } from 'drizzle-orm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RecordPaymentForm } from './record-payment-form';

const STATUS_LABELS: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  draft: { label: 'Draft', variant: 'secondary' },
  pending: { label: 'Menunggu', variant: 'outline' },
  paid: { label: 'Lunas', variant: 'default' },
  cancelled: { label: 'Batal', variant: 'destructive' },
};

export default async function FinancePage() {
  await verifyRoleLevel(80);

  const [paymentList, studentRows, catalogItems] = await Promise.all([
    getPayments(),
    db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(and(eq(roles.level, 40), isNull(users.deletedAt))),
    db
      .select({
        id: paymentItems.id,
        code: paymentItems.code,
        name: paymentItems.name,
        description: paymentItems.description,
        standardPrice: paymentItems.standardPrice,
      })
      .from(paymentItems)
      .where(isNull(paymentItems.deletedAt))
      .orderBy(paymentItems.code),
  ]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Keuangan</h1>
        <p className="text-muted-foreground">Kelola pembayaran siswa.</p>
      </div>

      {/* Record Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Catat Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <RecordPaymentForm
            students={studentRows}
            paymentItems={catalogItems}
            recordAction={recordPayment}
          />
        </CardContent>
      </Card>

      {/* All Payments Table */}
      {paymentList.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Belum ada data pembayaran.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Semua Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Siswa</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentList.map((p) => {
                  const statusInfo =
                    STATUS_LABELS[p.status ?? 'draft'] ?? STATUS_LABELS.draft;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        {p.studentName ?? p.studentId}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {p.code}
                      </TableCell>
                      <TableCell>{p.description}</TableCell>
                      <TableCell className="font-medium">
                        Rp {Number(p.total).toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {p.status === 'pending' && (
                          <form
                            action={async () => {
                              'use server';
                              await confirmPayment(String(p.id));
                            }}
                          >
                            <Button size="sm" type="submit">
                              Konfirmasi
                            </Button>
                          </form>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
