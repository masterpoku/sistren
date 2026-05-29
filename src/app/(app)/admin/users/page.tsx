import { db } from '@/lib/db';
import { users, roles } from '@/lib/db/schema';
import { eq, isNull, desc } from 'drizzle-orm';
import { verifyRoleLevel } from '@/lib/auth/verify-session';
import { createStaffAccount, deleteStaffAccount } from '@/actions/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

async function getUsers() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      roleId: users.roleId,
      roleName: roles.name,
      roleLevel: roles.level,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(isNull(users.deletedAt))
    .orderBy(desc(users.createdAt));
}

export default async function AdminUsersPage() {
  await verifyRoleLevel(80);

  const userList = await getUsers();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Pengguna</h1>
          <p className="text-muted-foreground">
            Buat dan kelola akun staff (guru, administrator).
          </p>
        </div>
      </div>

      {/* Create Form */}
      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-4">Tambah Pengguna Baru</h2>
        <form
          action={async (formData: FormData) => {
            'use server';
            const result = await createStaffAccount(formData);
            if (result && 'error' in result) {
              throw new Error(result.error);
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <div className="space-y-1">
            <Label htmlFor="name">Nama</Label>
            <Input id="name" name="name" placeholder="Nama lengkap" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@sekolah.sch.id"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 6 karakter"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="roleId">Role</Label>
            <Select name="roleId" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60">Guru</SelectItem>
                <SelectItem value="80">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Tambah
            </Button>
          </div>
        </form>
      </div>

      {/* User List */}
      {userList.length === 0 ? (
        <p className="text-muted-foreground">Belum ada pengguna.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Dibuat</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userList.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {user.roleName ?? 'unknown'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.emailVerified ? (
                    <Badge variant="default" className="bg-green-500">
                      Aktif
                    </Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.createdAt?.toLocaleDateString('id-ID')}
                </TableCell>
                <TableCell>
                  {user.roleName !== 'superadmin' && (
                    <form
                      action={async () => {
                        'use server';
                        await deleteStaffAccount(user.id);
                      }}
                    >
                      <Button size="sm" variant="destructive" type="submit">
                        Hapus
                      </Button>
                    </form>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
