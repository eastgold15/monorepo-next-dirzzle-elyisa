// 获取角色显示名称的 hook
export function useRoleDisplayName() {
  const getRoleDisplayName = (role?: string): string => {
    switch (role) {
      case "super_admin":
        return "超级管理员";
      case "exporter_admin":
        return "出口商管理员";
      case "factory_admin":
        return "工厂管理员";
      case "salesperson":
        return "业务员";
      default:
        return "用户";
    }
  };

  return getRoleDisplayName;
}