# 权限控制系统使用指南

## 概述

新的权限控制系统提供了灵活的权限和角色检查功能，支持：
- 单个权限检查
- 多个权限组合检查
- 角色检查
- 权限通配符匹配

## 安装和导入

```typescript
// 导入权限控制组件
import {
  Has,
  HasPermission,
  HasAnyPermission,
  HasAllPermissions,
  HasRole
} from '@/components/auth';

// 导入权限 hooks
import {
  usePermissions,
  usePermission,
  useRole
} from '@/hooks/usePermissions';

// 导入权限常量
import { PERMISSIONS, ROLES } from '@/config/permissions';
```

## 组件使用方式

### 1. 基本权限检查

```tsx
import { Has } from '@/components/auth';
import { PERMISSIONS } from '@/config/permissions';

// 单个权限检查
<Has permission={PERMISSIONS.USER.CREATE}>
  <button>创建用户</button>
</Has>

// 带回退内容
<Has permission={PERMISSIONS.USER.DELETE} fallback={<span>无权限删除</span>}>
  <button>删除用户</button>
</Has>
```

### 2. 多个权限检查

```tsx
import { HasAnyPermission, HasAllPermissions } from '@/components/auth';

// 满足任一权限即可
<HasAnyPermission
  permissions={[PERMISSIONS.USER.CREATE, PERMISSIONS.USER.UPDATE]}
>
  <button>用户管理</button>
</HasAnyPermission>

// 必须拥有所有权限
<HasAllPermissions
  permissions={[PERMISSIONS.PRODUCT.CREATE, PERMISSIONS.SKU.CREATE]}
>
  <button>创建商品和SKU</button>
</HasAllPermissions>
```

### 3. 角色检查

```tsx
import { HasRole } from '@/components/auth';
import { ROLES } from '@/config/permissions';

// 单个角色
<HasRole role={ROLES.ADMIN}>
  <AdminPanel />
</HasRole>

// 多个角色
<HasRole role={[ROLES.ADMIN, ROLES.MODERATOR]}>
  <ModerationTools />
</HasRole>
```

## Hooks 使用方式

### 1. 基本权限 Hook

```tsx
import { usePermission } from '@/hooks/usePermissions';

function DeleteButton() {
  const canDelete = usePermission(PERMISSIONS.USER.DELETE);

  return (
    <button disabled={!canDelete}>
      {canDelete ? '删除' : '无权限删除'}
    </button>
  );
}
```

### 2. 组合权限 Hook

```tsx
import { usePermissions } from '@/hooks/usePermissions';

function UserActions() {
  const {
    canManageUsers,
    canManageProducts,
    isSuperAdmin,
    getUserDisplayName
  } = usePermissions();

  return (
    <div>
      <p>当前用户: {getUserDisplayName()}</p>
      {canManageUsers && <button>用户管理</button>}
      {canManageProducts && <button>商品管理</button>}
      {isSuperAdmin() && <button>系统设置</button>}
    </div>
  );
}
```

### 3. 角色 Hook

```tsx
import { useRole } from '@/hooks/useRoles';

function AdminPanel() {
  const isAdmin = useRole(ROLES.ADMIN);

  if (!isAdmin) {
    return <div>无权限访问</div>;
  }

  return <AdminDashboard />;
}
```

## 权限常量使用

```tsx
import { PERMISSIONS, ROLES } from '@/config/permissions';

// 在 API 调用中使用
const createUser = () => {
  // 使用权限常量而不是硬编码字符串
  if (hasPermission(PERMISSIONS.USER.CREATE)) {
    api.user.create(userData);
  }
};

// 在路由守卫中使用
const ProtectedRoute = ({ children, requiredPermission }) => {
  const { can } = usePermissions();

  if (!can(requiredPermission)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};
```

## 常见使用场景

### 1. 条件渲染

```tsx
function ProductList() {
  const { canCreateProduct, canDeleteProduct } = usePermissions();

  return (
    <div>
      {canCreateProduct && (
        <button>添加商品</button>
      )}

      <ProductTable
        actions={
          canDeleteProduct ? <DeleteButton /> : <ViewButton />
        }
      />
    </div>
  );
}
```

### 2. 动态菜单

```tsx
function Navigation() {
  const { canManageUsers, canManageProducts, canManageOrders } = usePermissions();

  const menuItems = [
    { label: '首页', path: '/' },
    canManageUsers && { label: '用户管理', path: '/users' },
    canManageProducts && { label: '商品管理', path: '/products' },
    canManageOrders && { label: '订单管理', path: '/orders' },
  ].filter(Boolean);

  return <Menu items={menuItems} />;
}
```

### 3. 表单字段权限

```tsx
function UserForm({ user }) {
  const { canManageRoles, canManageStatus } = usePermissions();

  return (
    <form>
      <Input name="name" label="姓名" />
      <Input name="email" label="邮箱" />

      {canManageRoles && (
        <Select name="role" label="角色" options={roleOptions} />
      )}

      {canManageStatus && (
        <Switch name="isActive" label="启用状态" />
      )}

      <Button type="submit">保存</Button>
    </form>
  );
}
```

## 最佳实践

1. **使用权限常量**：始终从 `PERMISSIONS` 导入权限名称，避免硬编码字符串
2. **权限分组**：对于相关的权限，使用 `HasAnyPermission` 或 `HasAllPermissions`
3. **角色检查**：对于明显的角色权限，使用 `HasRole` 组件或 `useRole` hook
4. **优雅降级**：为无权限的用户提供合适的回退内容
5. **性能优化**：对于复杂的权限逻辑，使用 `useMemo` 缓存结果

## 类型安全

所有权限名称都有 TypeScript 类型定义，确保：
- 编译时检查权限名称的正确性
- IDE 自动补全和类型提示
- 重构时自动更新权限引用

```typescript
// ✅ 类型安全
const canCreate = usePermission(PERMISSIONS.USER.CREATE);

// ❌ 避免硬编码
const canCreate = usePermission('user:create'); // 没有类型提示
```