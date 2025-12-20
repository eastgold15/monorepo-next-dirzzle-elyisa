// 权限控制组件

// 权限控制 hooks
export {
  useAllPermissions,
  useAnyPermission,
  usePermission,
  usePermissions,
  useRole,
} from "../../hooks/usePermissions";
export {
  Has,
  HasAllPermissions,
  HasAnyPermission,
  HasPermission,
  HasRole,
} from "../Has";

// 角色权限便捷组件
export const IsExporterAdmin = ({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => (
  <HasRole fallback={fallback} role="exporter_admin">
    {children}
  </HasRole>
);

export const IsFactoryAdmin = ({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => (
  <HasRole fallback={fallback} role="factory_admin">
    {children}
  </HasRole>
);

export const IsSalesperson = ({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => (
  <HasRole fallback={fallback} role="salesperson">
    {children}
  </HasRole>
);

export const IsSuperAdmin = ({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => (
  <HasRole fallback={fallback} role="super_admin">
    {children}
  </HasRole>
);
