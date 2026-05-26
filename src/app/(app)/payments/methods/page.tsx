import { getPaymentMethods, createPaymentMethod } from '@/actions/payments'
import { verifyRoleLevel } from '@/lib/auth/verify-session'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function PaymentMethodsPage() {
  await verifyRoleLevel(80)

  const methodList = await getPaymentMethods()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Metode Pembayaran</h1>
        <p className="text-muted-foreground">Kelola metode pembayaran (transfer, cash, e-wallet).</p>
      </div>

      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle>Tambah Metode</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={async (formData: FormData) => {
            'use server'
            const result = await createPaymentMethod(formData)
            if (result && 'error' in result) {
              throw new Error(result.error)
            }
          }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Metode</Label>
              <Input id="name" name="name" placeholder="Bank BCA" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Nomor Rekening</Label>
              <Input id="accountNumber" name="accountNumber" placeholder="1234567890" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountName">Nama Pemilik</Label>
              <Input id="accountName" name="accountName" placeholder="SMK Terpadu" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Input id="provider" name="provider" placeholder="Bank BCA" />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">Tambah</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Methods List */}
      {methodList.length === 0 ? (
        <p className="text-muted-foreground">Belum ada metode pembayaran.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Nomor Rekening</TableHead>
              <TableHead>Nama Pemilik</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {methodList.map((m: { id: number; name: string; provider: string | null; accountNumber: string | null; accountName: string | null }) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>{m.provider ?? '-'}</TableCell>
                <TableCell>{m.accountNumber ?? '-'}</TableCell>
                <TableCell>{m.accountName ?? '-'}</TableCell>
                <TableCell>
                  <form action={async () => {
                    'use server'
                    const { deletePaymentMethod } = await import('@/actions/payments')
                    await deletePaymentMethod(String(m.id))
                  }}>
                    <Button size="sm" variant="destructive" type="submit">Hapus</Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}