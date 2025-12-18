import { useAuthStore } from "@/stores/auth-store";

// 单个权限检查组件
interface HasPermissionProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const HasPermission = ({ permission, children, fallback }: HasPermissionProps) => {
  const can = useAuthStore(store => store.can);

  if (!can(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// 多个权限检查组件（满足任一即可）
interface HasAnyPermissionProps {
  permissions: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const HasAnyPermission = ({ permissions, children, fallback }: HasAnyPermissionProps) => {
  const can = useAuthStore(store => store.can);

  const hasAny = permissions.some(permission => can(permission));

  if (!hasAny) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// 多个权限检查组件（必须全部满足）
interface HasAllPermissionsProps {
  permissions: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const HasAllPermissions = ({ permissions, children, fallback }: HasAllPermissionsProps) => {
  const can = useAuthStore(store => store.can);

  const hasAll = permissions.every(permission => can(permission));

  if (!hasAll) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// 角色检查组件
interface HasRoleProps {
  role: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const HasRole = ({ role, children, fallback }: HasRoleProps) => {
  const { user } = useAuthStore(store => ({ user: store.user }));

  if (!user) {
    return <>{fallback}</>;
  }

  const userRole = user.role?.name;
  const requiredRoles = Array.isArray(role) ? role : [role];

  if (!userRole || !requiredRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// 保持向后兼容的 Has 组件（别名）
export const Has = HasPermission;