import { useAuthStore } from "@/stores/auth-store";

interface HasProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * 权限控制组件
 * @param permission 需要的权限，如 'USERS_VIEW', 'PRODUCTS_CREATE' 等
 * @param children 有权限时显示的内容
 * @param fallback 无权限时显示的内容（默认为 null）
 */
export function Has({ permission, children, fallback = null }: HasProps) {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// 角色检查组件
interface HasRoleProps {
  role: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function HasRole({ role, children, fallback = null }: HasRoleProps) {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = useAuthStore((state) => state.isSuperAdmin);

  // 超级管理员拥有所有角色权限
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  if (!user) {
    return <>{fallback}</>;
  }

  const userRole = user.role?.name
  const requiredRoles = Array.isArray(role) ? role : [role];

  if (!(userRole && requiredRoles.includes(userRole))) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
