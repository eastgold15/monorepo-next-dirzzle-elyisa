当前权限层级
系统层级（暂未实现）
    ↓
出口商管理员 (exporter_admin) - 目前最高权限
    ↓
工厂管理员 (factory_admin)
    ↓
业务员 (salesperson)
当前系统限制
无法通过UI创建出口商 - 如你所说，当前系统没有比出口商更大的权限角色
单出口商管理 - 每个出口商管理员只能管理自己的工厂和业务员
数据隔离 - 出口商之间数据完全隔离，无法互相访问
未来扩展方案
如果需要支持多出口商管理，可以这样扩展：
1. 添加系统管理员角色
// 在 packages/contract/src/modules/01auth/auth.t.model.ts 中添加
export type UserRole = 
  | "super_admin"      // 新增：系统管理员
  | "exporter_admin"   // 出口商管理员
  | "factory_admin"    // 工厂管理员  
  | "salesperson";     // 业务员
2. 权限范围扩展
export const ROLE_DATA_SCOPE: Record<UserRole, DataScope> = {
  super_admin: {
    products: 'all',      // 可访问所有产品
    users: 'all',         // 可管理所有用户
    factories: 'all',     // 可管理所有工厂
    orders: 'all',        // 可查看所有订单
  },
  exporter_admin: {
    products: 'exporter', // 只能访问自己出口商的产品
    users: 'exporter',
    factories: 'exporter',
    orders: 'exporter',
  },
  // ... 其他角色保持不变
};
3. 数据库结构调整
对于多出口商管理，需要确保：
-- super_admin 不需要特定的 resourceType 和 resourceId
-- 或者可以为 system 资源类型
INSERT INTO user_resource_roles (user_id, resource_type, resource_id, role_id, is_primary) 
VALUES ('super-admin-id', 'system', 'global', 'super-admin-role-id', true);
4. API 权限检查
// 在权限检查中添加系统管理员判断
const canManageExporter = (userRole: string, userExporterId: string, targetExporterId: string) => {
  if (userRole === 'super_admin') {
    return true;  // 系统管理员可以管理所有出口商
  }
  return userRole === 'exporter_admin' && userExporterId === targetExporterId;
};
你当前的做法很明智
直接在数据库创建出口商是合理的，因为：
出口商创建频率低 - 通常不会频繁创建新的出口商
数据安全性 - 避免误操作创建出口商
简化权限模型 - 当前系统专注于出口商内部管理
如果以后需要扩展，可以：
先添加 super_admin 角色到数据库
创建简单的管理界面用于出口商管理
逐步完善多租户管理功能
当前的设计已经为未来扩展预留了空间，多出口商管理的架构基础已经具备