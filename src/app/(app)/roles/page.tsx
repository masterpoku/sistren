import { verifyRoleLevel } from '@/lib/auth/verify-session'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const ROLES = [
  { name: 'Superadmin', level: 100, description: 'Full system access' },
  { name: 'Administrator', level: 80, description: 'Admin staff (TU)' },
  { name: 'Guru', level: 60, description: 'Teacher' },
  { name: 'Siswa', level: 40, description: 'Student' },
  { name: 'Alumni', level: 20, description: 'Read-only graduate access' },
]

export default async function RolesPage() {
  await verifyRoleLevel(80)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Roles</h1>
        <p className="text-muted-foreground">Daftar role dan level akses.</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Role</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Deskripsi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROLES.map((role) => (
            <TableRow key={role.level}>
              <TableCell className="font-medium">
                <Badge variant="secondary" className="capitalize">{role.name}</Badge>
              </TableCell>
              <TableCell>{role.level}</TableCell>
              <TableCell className="text-muted-foreground">{role.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}