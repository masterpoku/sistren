'use client';

import { useEffect, useState } from 'react';

export interface PermissionContext {
  permissions: Set<string>;
  roleLevel: number;
  roleName: string;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRoleLevel: (minLevel: number) => boolean;
  loading: boolean;
}

export function usePermissions(): PermissionContext {
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [roleLevel, setRoleLevel] = useState<number>(0);
  const [roleName, setRoleName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPermissions() {
      try {
        const response = await fetch('/api/auth/permissions');
        if (response.ok) {
          const data = await response.json();
          setPermissions(new Set(data.permissions));
          setRoleLevel(data.roleLevel);
          setRoleName(data.roleName);
        }
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPermissions();
  }, []);

  const hasPermission = (permission: string): boolean => {
    if (roleLevel >= 100) return true;
    return permissions.has(permission);
  };

  const hasAnyPermission = (permList: string[]): boolean => {
    if (roleLevel >= 100) return true;
    return permList.some((p) => permissions.has(p));
  };

  const hasAllPermissions = (permList: string[]): boolean => {
    if (roleLevel >= 100) return true;
    return permList.every((p) => permissions.has(p));
  };

  const hasRoleLevel = (minLevel: number): boolean => {
    return roleLevel >= minLevel;
  };

  return {
    permissions,
    roleLevel,
    roleName,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRoleLevel,
    loading,
  };
}
