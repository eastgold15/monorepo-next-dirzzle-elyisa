"use client";

import { ReactNode } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import type { Permission } from "@repo/contract";

interface PermissionGuardProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // 是否需要所有权限（默认只需要任一权限）
  fallback?: ReactNode; // 无权限时显示的内容
  role?: string; // 可选的角色检查
}

export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  role,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, role: userRole } = usePermissions();

  // 检查角色
  if (role && userRole !== role) {
    return <>{fallback}</>;
  }

  // 检查权限
  let hasRequiredPermission = true;

  if (permission) {
    hasRequiredPermission = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    if (requireAll) {
      hasRequiredPermission = hasAllPermissions(permissions);
    } else {
      hasRequiredPermission = hasAnyPermission(permissions);
    }
  }

  return hasRequiredPermission ? <>{children}</> : <>{fallback}</>;
}

// 便捷的高阶函数组件
export function CanViewUsers({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard permission="view_users" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function CanCreateUsers({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard permission="create_users" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function CanManageFactories({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard permissions={["view_factories", "edit_factories"]} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function CanManageProducts({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard
      permissions={["view_products", "create_products", "edit_products"]}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function CanCreateProducts({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard permission="create_products" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function CanEditProducts({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard permission="edit_products" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function CanUploadMedia({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard permission="upload_media" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function CanViewAnalytics({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard permission="view_analytics" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function CanEditSiteConfig({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard permission="edit_site_config" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function IsExporterAdmin({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard role="exporter_admin" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function IsFactoryAdmin({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard role="factory_admin" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function IsSalesperson({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard role="salesperson" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}