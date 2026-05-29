import { getPayments, recordPayment } from '@/actions/payments';
import { verifyRoleLevel } from '@/lib/auth/verify-session';
import { db } from '@/lib/db';
import { users, roles } from '@/lib/db/schema';
import { eq, isNull, and } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  pending: { label: 'Menunggu', variant: 'outline' },
  paid: { label: 'Lunas', variant: 'default' },
  cancelled: { label: 'Batal', variant: 'destructive' },
};

export default async function FinancePage() {
  await verifyRoleLevel(80);

  const [paymentList, studentRows] = await Promise.all([
    getPayments(),
    db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(and(eq(roles.level, 40), isNull(users.deletedAt))),
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
          <form
            action={async (formData: FormData) => {
              'use server';
              const result = await recordPayment(formData);
              if (result && 'error' in result) {
                throw new Error(result.error);
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
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
                {studentRows.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Input id="description" name="description" placeholder="SPP Bulan Juli 2025" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Jumlah (Rp)</Label>
              <Input id="price" name="price" type="number" step="1000" placeholder="150000" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Jumlah Bulan</Label>
              <Input id="quantity" name="quantity" type="number" defaultValue="1" min="1" />
            </div>
            <div className="lg:col-span-4 flex items-end">
              <Button type="submit" className="w-full sm:w-auto">Catat Pembayaran</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* All Payments Table */}
      {paymentList.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Belum ada data pembayaran.</p>
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
                  const statusInfo = STATUS_LABELS[p.status ?? 'draft'] ?? STATUS_LABELS.draft;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.studentName ?? p.studentId}</TableCell>
                      <TableCell className="font-mono text-sm">{p.code}</TableCell>
                      <TableCell>{p.description}</TableCell>
                      <TableCell className="font-medium">
                        Rp {Number(p.total).toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </TableCell>
                    <TableCell>
                        {p.status === 'pending' && (
                          <form
                            action={async () => {
                              'use server';
                              const { confirmPayment } = await import('@/actions/payments');
                              await confirmPayment(String(p.id));
                            }}
                          >
                            <Button size="sm" type="submit">Konfirmasi</Button>
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