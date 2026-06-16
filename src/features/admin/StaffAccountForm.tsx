import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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

export function StaffAccountForm({ item, roles, showPassword = true }: StaffAccountFormProps) {
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
                <Select
                    name="roleId"
                    defaultValue={item?.roleId ? String(item.roleId) : ""}
                    required
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                        {roles.map((r) => (
                            <SelectItem key={r.id} value={String(r.id)}>
                                {r.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
