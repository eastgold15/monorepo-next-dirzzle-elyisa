"use client";

import type { Permission } from "@repo/contract";
import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/use-permissions";

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
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    role: userRole,
  } = usePermissions();

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
export function CanViewUsers({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard fallback={fallback} permission="view_users">
      {children}
    </PermissionGuard>
  );
}

export function CanCreateUsers({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard fallback={fallback} permission="create_users">
      {children}
    </PermissionGuard>
  );
}

export function CanManageFactories({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard
      fallback={fallback}
      permissions={["view_factories", "edit_factories"]}
    >
      {children}
    </PermissionGuard>
  );
}

export function CanManageProducts({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard
      fallback={fallback}
      permissions={["view_products", "create_products", "edit_products"]}
    >
      {children}
    </PermissionGuard>
  );
}

export function CanCreateProducts({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard fallback={fallback} permission="create_products">
      {children}
    </PermissionGuard>
  );
}

export function CanEditProducts({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard fallback={fallback} permission="edit_products">
      {children}
    </PermissionGuard>
  );
}

export function CanUploadMedia({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard fallback={fallback} permission="upload_media">
      {children}
    </PermissionGuard>
  );
}

export function CanViewAnalytics({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard fallback={fallback} permission="view_analytics">
      {children}
    </PermissionGuard>
  );
}

export function CanEditSiteConfig({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard fallback={fallback} permission="edit_site_config">
      {children}
    </PermissionGuard>
  );
}

export function IsExporterAdmin({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard fallback={fallback} role="exporter_admin">
      {children}
    </PermissionGuard>
  );
}

export function IsFactoryAdmin({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard fallback={fallback} role="factory_admin">
      {children}
    </PermissionGuard>
  );
}

export function IsSalesperson({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard fallback={fallback} role="salesperson">
      {children}
    </PermissionGuard>
  );
}

export function CanEditUsers({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard fallback={fallback} permission="edit_users">
      {children}
    </PermissionGuard>
  );
}
