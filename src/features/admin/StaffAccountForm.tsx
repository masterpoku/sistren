import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface StaffAccountFormValues {
  name: string;
  email: string;
  password?: string;
  roleId: number;
}

interface StaffAccountFormProps {
  item?: StaffAccountFormValues;
  roles: { id: number; name: string }[];
  showPassword?: boolean;
}

export function StaffAccountForm({
  item,
  roles,
  showPassword = true,
}: StaffAccountFormProps) {
  return (
    <div className="grid gap-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="staff-name">Nama</Label>
        <Input
          id="staff-name"
          name="name"
          placeholder="Budi Santoso"
          defaultValue={item?.name ?? ""}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="staff-email">Email</Label>
        <Input
          id="staff-email"
          name="email"
          type="email"
          placeholder="budi@sekolah.id"
          defaultValue={item?.email ?? ""}
          required
        />
      </div>
      {showPassword ? (
        <div className="space-y-2">
          <Label htmlFor="staff-password">Password</Label>
          <Input
            id="staff-password"
            name="password"
            type="password"
            placeholder="Min. 6 karakter"
            minLength={6}
            required
          />
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="staff-role">Role</Label>
        <select
          id="staff-role"
          name="roleId"
          defaultValue={item?.roleId != null ? String(item.roleId) : ""}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          <option value="" disabled>
            Pilih role
          </option>
          {roles.map((r) => (
            <option key={r.id} value={String(r.id)}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
