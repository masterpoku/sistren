"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

type Role = {
  id: number;
  name: string;
  description: string | null;
  level: number | null;
  isDefault: boolean | null;
};

type Permission = {
  id: number;
  name: string;
  description: string | null;
  resource: string | null;
  action: string | null;
  scope: string | null;
};

const LEVEL_LABELS: Record<
  number,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  100: { label: "Superadmin", variant: "destructive" },
  80: { label: "Admin", variant: "default" },
  60: { label: "Guru", variant: "secondary" },
  40: { label: "Siswa", variant: "outline" },
  20: { label: "Alumni", variant: "outline" },
};

interface PermissionsClientProps {
  roles: Role[];
  permissions: Permission[];
  rolePermissions: Record<number, number[]>;
}

export function PermissionsClient({
  roles,
  permissions,
  rolePermissions,
}: PermissionsClientProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(
    roles[0] ?? null
  );
  const [assigned, setAssigned] = useState<number[]>(
    rolePermissions[roles[0]?.id] ?? []
  );
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleRoleSelect(role: Role) {
    setSelectedRole(role);
    setAssigned(rolePermissions[role.id] ?? []);
  }

  async function handleToggle(permissionId: number) {
    if (!selectedRole) return;

    const isAssigned = assigned.includes(permissionId);

    // Optimistic update
    setAssigned((prev) =>
      isAssigned
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );

    startTransition(async () => {
      const action = await import("@/actions/permissions");
      const result = isAssigned
        ? await action.revokePermission(selectedRole.id, permissionId)
        : await action.assignPermission(selectedRole.id, permissionId);

      if (!("success" in result)) {
        // Rollback optimistic update
        setAssigned((prev) =>
          isAssigned
            ? [...prev, permissionId]
            : prev.filter((id) => id !== permissionId)
        );
        toast({
          variant: "destructive",
          description: "Gagal memperbarui izin.",
        });
      }
    });
  }

  // Group permissions by resource
  const grouped = permissions.reduce<Record<string, Permission[]>>(
    (acc, perm) => {
      const resource = perm.resource ?? "other";
      if (!acc[resource]) acc[resource] = [];
      acc[resource].push(perm);
      return acc;
    },
    {}
  );
  const sortedResources = Object.keys(grouped).sort();

  const selectedLevel = selectedRole?.level ?? 0;
  const levelConfig = LEVEL_LABELS[selectedLevel] ?? {
    label: `Level ${selectedLevel}`,
    variant: "outline" as const,
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* Left panel: role list */}
      <div className="w-64 shrink-0">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Role</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100%-3rem)]">
              <div className="space-y-1 px-3 pb-3">
                {roles.map((role) => {
                  const lc = LEVEL_LABELS[role.level ?? 0] ?? {
                    label: `Level ${role.level ?? 0}`,
                    variant: "outline" as const,
                  };
                  const isSelected = selectedRole?.id === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role)}
                      className={`w-full text-left flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5 text-primary font-medium"
                          : "border-transparent hover:bg-muted"
                      }`}
                    >
                      <span className="truncate">{role.name}</span>
                      <Badge
                        variant={lc.variant}
                        className="shrink-0 text-[10px]"
                      >
                        {lc.label}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right panel: permissions */}
      <div className="flex-1 min-w-0">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3 shrink-0">
            <div className="flex items-center gap-3">
              <CardTitle className="text-base">
                {selectedRole?.name ?? "Pilih role"}
              </CardTitle>
              <Badge variant={levelConfig.variant}>{levelConfig.label}</Badge>
              {selectedRole?.isDefault && (
                <Badge variant="outline" className="text-[10px]">
                  Default
                </Badge>
              )}
            </div>
            {selectedRole?.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {selectedRole.description}
              </p>
            )}
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-0">
            <ScrollArea className="h-full px-6 pb-6">
              {sortedResources.map((resource) => (
                <div key={resource} className="mb-6">
                  <h3 className="text-sm font-semibold mb-2 capitalize">
                    {resource.replace(/_/g, " ")}
                  </h3>
                  <div className="space-y-2">
                    {grouped[resource].map((perm) => {
                      const isChecked = assigned.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          htmlFor={String(perm.id)}
                          className="flex items-start gap-3 cursor-pointer group"
                        >
                          <Checkbox
                            id={String(perm.id)}
                            checked={isChecked}
                            onCheckedChange={() => handleToggle(perm.id)}
                            disabled={isPending}
                            className="mt-0.5"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-mono group-hover:text-primary transition-colors">
                              {perm.name}
                            </p>
                            {perm.description && (
                              <p className="text-xs text-muted-foreground">
                                {perm.description}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
