'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { Skeleton } from '@/components/ui/skeleton';

interface RequirePermissionProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequirePermission({
  permission,
  children,
  fallback = null,
}: RequirePermissionProps) {
  const { hasPermission, loading } = usePermissions();

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RequireAnyPermissionProps {
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireAnyPermission({
  permissions,
  children,
  fallback = null,
}: RequireAnyPermissionProps) {
  const { hasAnyPermission, loading } = usePermissions();

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (!hasAnyPermission(permissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RequireAllPermissionsProps {
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireAllPermissions({
  permissions,
  children,
  fallback = null,
}: RequireAllPermissionsProps) {
  const { hasAllPermissions, loading } = usePermissions();

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (!hasAllPermissions(permissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RequireRoleLevelProps {
  minLevel: number;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireRoleLevel({
  minLevel,
  children,
  fallback = null,
}: RequireRoleLevelProps) {
  const { hasRoleLevel, loading } = usePermissions();

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (!hasRoleLevel(minLevel)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
