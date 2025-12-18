// 权限控制组件
export {
  Has,
  HasPermission,
  HasAnyPermission,
  HasAllPermissions,
  HasRole
} from '../Has';

// 权限控制 hooks
export {
  usePermissions,
  usePermission,
  useAllPermissions,
  useAnyPermission,
  useRole,
} from '../../hooks/usePermissions';

// 角色权限便捷组件
export const IsExporterAdmin = ({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) => (
  <HasRole role="exporter_admin" fallback={fallback}>
    {children}
  </HasRole>
);

export const IsFactoryAdmin = ({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) => (
  <HasRole role="factory_admin" fallback={fallback}>
    {children}
  </HasRole>
);

export const IsSalesperson = ({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) => (
  <HasRole role="salesperson" fallback={fallback}>
    {children}
  </HasRole>
);

export const IsSuperAdmin = ({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) => (
  <HasRole role="super_admin" fallback={fallback}>
    {children}
  </HasRole>
);