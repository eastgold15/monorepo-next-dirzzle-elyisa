# 权限组件使用示例

## 基本用法

### 1. 导入权限组件

```typescript
// 方式一：导入所有需要的组件
import {
  HasPermission,
  HasAnyPermission,
  HasAllPermissions,
  HasRole,
  IsExporterAdmin,
  IsFactoryAdmin
} from '@/components/auth';

// 方式二：从权限配置文件导入
import { PERMISSIONS, ROLES } from '@/config/permissions';
```

### 2. 按钮权限控制

```tsx
import { HasPermission } from '@/components/auth';
import { PERMISSIONS } from '@/config/permissions';

// 单个权限
<HasPermission permission={PERMISSIONS.USER.CREATE}>
  <button className="btn-primary">创建用户</button>
</HasPermission>

// 无权限时显示禁用按钮
<HasPermission
  permission={PERMISSIONS.USER.DELETE}
  fallback={<button className="btn-disabled" disabled>删除用户</button>}
>
  <button className="btn-danger">删除用户</button>
</HasPermission>
```

### 3. 功能模块权限控制

```tsx
import { HasAnyPermission } from '@/components/auth';
import { PERMISSIONS } from '@/config/permissions';

// 需要任一权限即可访问
<HasAnyPermission
  permissions={[
    PERMISSIONS.USER.CREATE,
    PERMISSIONS.USER.UPDATE,
    PERMISSIONS.USER.DELETE
  ]}
>
  <div className="user-management-module">
    <h2>用户管理</h2>
    <button>添加用户</button>
    <button>编辑用户</button>
    <button>删除用户</button>
  </div>
</HasAnyPermission>
```

### 4. 角色权限控制

```tsx
import { HasRole, IsExporterAdmin } from '@/components/auth';
import { ROLES } from '@/config/permissions';

// 检查单个角色
<HasRole role={ROLES.ADMIN}>
  <AdminPanel />
</HasRole>

// 使用便捷组件
<IsExporterAdmin>
  <ExporterDashboard />
</IsExporterAdmin>

// 检查多个角色
<HasRole role={[ROLES.ADMIN, ROLES.MODERATOR]}>
  <ModerationTools />
</HasRole>
```

### 5. 菜单项权限控制

```tsx
import { HasPermission, HasRole } from '@/components/auth';
import { PERMISSIONS, ROLES } from '@/config/permissions';

function Sidebar() {
  return (
    <nav className="sidebar">
      {/* 所有用户可见 */}
      <a href="/dashboard">仪表盘</a>

      {/* 需要用户管理权限 */}
      <HasPermission permission={PERMISSIONS.USER.READ}>
        <a href="/users">用户管理</a>
      </HasPermission>

      {/* 需要商品管理权限 */}
      <HasAnyPermission
        permissions={[
          PERMISSIONS.PRODUCT.CREATE,
          PERMISSIONS.PRODUCT.READ,
          PERMISSIONS.PRODUCT.UPDATE
        ]}
      >
        <a href="/products">商品管理</a>
      </HasAnyPermission>

      {/* 仅超级管理员可见 */}
      <HasRole role={ROLES.SUPER_ADMIN}>
        <a href="/system">系统设置</a>
      </HasRole>
    </nav>
  );
}
```

### 6. 表单字段权限控制

```tsx
import { HasPermission } from '@/components/auth';
import { PERMISSIONS } from '@/config/permissions';

function UserForm({ user }) {
  return (
    <form>
      <input name="name" placeholder="姓名" />
      <input name="email" placeholder="邮箱" />

      {/* 角色选择需要特殊权限 */}
      <HasPermission permission={PERMISSIONS.USER.MANAGE_ROLES}>
        <select name="role">
          <option value="user">普通用户</option>
          <option value="admin">管理员</option>
        </select>
      </HasPermission>

      {/* 状态切换需要管理权限 */}
      <HasPermission
        permission={PERMISSIONS.USER.UPDATE}
        fallback={
          <div className="flex items-center">
            <span>状态：{user.isActive ? '启用' : '禁用'}</span>
          </div>
        }
      >
        <label className="flex items-center">
          <input type="checkbox" name="isActive" />
          <span>启用用户</span>
        </label>
      </HasPermission>

      <button type="submit">保存</button>
    </form>
  );
}
```

### 7. 页面级权限控制

```tsx
import { HasRole } from '@/components/auth';
import { ROLES } from '@/config/permissions';

function UserManagementPage() {
  return (
    <HasRole role={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
      <div className="page">
        <h1>用户管理</h1>
        <UserTable />
        <Pagination />
      </div>
    </HasRole>
  );
}
```

### 8. 复杂权限组合

```tsx
import { HasAllPermissions, HasAnyPermission, HasRole } from '@/components/auth';
import { PERMISSIONS } from '@/config/permissions';

function AdvancedPermissionsExample() {
  return (
    <div>
      {/* 必须同时拥有创建和编辑权限 */}
      <HasAllPermissions
        permissions={[
          PERMISSIONS.PRODUCT.CREATE,
          PERMISSIONS.PRODUCT.UPDATE
        ]}
      >
        <ProductEditor />
      </HasAllPermissions>

      {/* 满足任一角色且拥有对应权限 */}
      <HasRole role={[ROLES.ADMIN, ROLES.EDITOR]}>
        <HasAnyPermission
          permissions={[
            PERMISSIONS.CONTENT.CREATE,
            PERMISSIONS.CONTENT.UPDATE
          ]}
        >
          <ContentManager />
        </HasAnyPermission>
      </HasRole>

      {/* 复杂的回退内容 */}
      <HasPermission
        permission={PERMISSIONS.SYSTEM.CONFIG}
        fallback={
          <div className="permission-notice">
            <p>您没有系统配置权限</p>
            <p>请联系管理员获取权限</p>
          </div>
        }
      >
        <SystemConfig />
      </HasPermission>
    </div>
  );
}
```

### 9. 动态权限检查

```tsx
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/config/permissions';

function DynamicComponent() {
  const { can, isSuperAdmin, getUserDisplayName } = usePermissions();

  const handleDelete = () => {
    if (can(PERMISSIONS.USER.DELETE)) {
      // 执行删除操作
      deleteUser();
    } else {
      // 显示权限不足提示
      alert('您没有删除用户的权限');
    }
  };

  return (
    <div>
      <p>当前用户：{getUserDisplayName()}</p>

      <button
        onClick={handleDelete}
        disabled={!can(PERMISSIONS.USER.DELETE)}
        className={can(PERMISSIONS.USER.DELETE) ? 'btn-danger' : 'btn-disabled'}
      >
        {can(PERMISSIONS.USER.DELETE) ? '删除用户' : '无权限删除'}
      </button>

      {isSuperAdmin() && (
        <button className="btn-admin">管理员功能</button>
      )}
    </div>
  );
}
```

### 10. 路由守卫

```tsx
import { usePermission } from '@/hooks/usePermissions';
import { Navigate } from 'react-router-dom';
import { PERMISSIONS } from '@/config/permissions';

function ProtectedRoute({ children, permission }) {
  const hasPermission = usePermission(permission);

  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// 使用示例
function AppRoutes() {
  return (
    <Routes>
      <Route path="/users" element={
        <ProtectedRoute permission={PERMISSIONS.USER.READ}>
          <UserList />
        </ProtectedRoute>
      } />

      <Route path="/system" element={
        <ProtectedRoute permission={PERMISSIONS.SYSTEM.CONFIG}>
          <SystemSettings />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
```

## 最佳实践

1. **使用权限常量**：始终从 `PERMISSIONS` 导入，避免硬编码
2. **优雅降级**：为无权限用户提供合适的提示信息
3. **性能优化**：对于复杂的权限逻辑，使用 useMemo 缓存结果
4. **合理分组**：将相关的权限检查放在一起
5. **用户体验**：禁用按钮而不是隐藏，让用户知道功能存在但无权限

## 类型安全

所有权限都有 TypeScript 类型支持：

```typescript
// ✅ 类型安全
<HasPermission permission={PERMISSIONS.USER.CREATE} />

// ❌ 避免硬编码
<HasPermission permission="user:create" />
```

这样可以获得：
- IDE 自动补全
- 编译时类型检查
- 重构时自动更新