# API Hooks 架构说明

本文档说明了项目中 API hooks 的架构设计原则和最佳实践。

## 架构原则

### 1. 类型安全优先
- 所有 API 类型定义在 `@repo/contract` 契约层
- 前后端共享类型定义，确保一致性
- 使用 TypeScript 严格类型检查

### 2. 关注点分离
- **API 函数层**: 负责具体的 HTTP 请求
- **React Query Hooks**: 负责状态管理和缓存
- **业务逻辑 Hooks**: 封装复杂业务逻辑

### 3. 命名规范
- Query hooks: `use[Resource]Query` 或 `use[Resource]sQuery`
- Mutation hooks: `use[Action][Resource]Mutation`
- 复合 hooks: `use[Resource]With[Feature]`

## 文件结构

```
src/hooks/api/
├── README.md                 # 架构文档
├── index.ts                  # 统一导出
├── use-user-api.ts          # 用户相关API hooks
├── use-product-api.ts       # 商品相关API hooks
├── use-category-api.ts      # 分类相关API hooks
├── use-factory-api.ts       # 工厂相关API hooks
└── ...                      # 其他业务模块hooks
```

## 使用示例

### 1. 基础 Query Hook

```typescript
// 获取用户列表
export const useUsersQuery = (params: UserListParams = {}, options = {}) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => userApi.getUsers(params),
    staleTime: 1000 * 60 * 5, // 5分钟缓存
    ...options,
  });
};
```

### 2. Mutation Hook

```typescript
// 创建业务员
export const useCreateSalespersonMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.createSalesperson,
    onSuccess: () => {
      // 成功后刷新相关数据
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: Error) => {
      // 统一错误处理
      console.error("创建业务员失败:", error);
    },
  });
};
```

### 3. 复合业务 Hook

```typescript
// 带搜索功能的用户管理
export const useUsersWithSearch = () => {
  const [searchParams, setSearchParams] = useState<UserListParams>({
    page: 1,
    limit: 20,
    search: "",
    role: "",
  });

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useUsersQuery(searchParams);

  const handleSearch = (search: string) => {
    setSearchParams(prev => ({ ...prev, search, page: 1 }));
  };

  return {
    users: usersData?.users || [],
    pagination: usersData?.pagination,
    isLoading,
    error,
    handleSearch,
    refetch,
  };
};
```

### 4. 在组件中使用

```typescript
export default function UsersPage() {
  // 使用复合hook，简化组件逻辑
  const {
    users,
    pagination,
    isLoading,
    handleSearch,
  } = useUsersWithSearch();

  // 使用mutation hook
  const { createSalesperson, isCreating } = useCreateSalespersonMutation();

  return (
    <div>
      {/* UI组件 */}
    </div>
  );
}
```

## 最佳实践

### 1. 缓存策略
- **查询数据**: 设置合适的 `staleTime` 和 `cacheTime`
- **实时数据**: 较短的缓存时间
- **静态数据**: 较长的缓存时间

### 2. 错误处理
- 统一的错误类型定义
- 用户友好的错误提示
- 自动重试机制

### 3. Loading 状态
- 使用 React Query 的 `isLoading`、`isFetching`
- 提供骨架屏或加载指示器
- 避免重复加载

### 4. 数据同步
- 使用 `invalidateQueries` 刷新相关数据
- 使用 `setQueryData` 更新本地缓存
- 合理使用乐观更新

## 类型定义规范

### 1. 契约层类型

```typescript
// packages/contract/src/modules/user/user.t.model.ts
export const UserEntity = t.Object({
  id: t.String(),
  name: t.String(),
  email: t.String(),
  // ...
});

export type User = typeof UserEntity.static;
```

### 2. 响应类型

```typescript
export const UserListResponse = t.Object({
  users: t.Array(UserEntity),
  pagination: t.Object({
    page: t.Number(),
    limit: t.Number(),
    total: t.Number(),
    totalPages: t.Number(),
  }),
});
```

### 3. 请求类型

```typescript
export const CreateSalespersonRequest = t.Object({
  name: t.String({ minLength: 2, maxLength: 100 }),
  email: t.String({ format: "email" }),
  // ...
});
```

## 常见问题

### 1. 类型不匹配
- 确保前后端使用相同的契约类型
- 使用 `@repo/contract` 导入类型

### 2. 缓存问题
- 使用正确的 queryKey
- 及时 invalidate 过期数据

### 3. 错误处理
- 不要在组件中直接处理错误
- 使用统一的错误边界

## 性能优化

### 1. 查询去重
```typescript
// 相同参数的查询会自动去重
useQuery({ queryKey: ["users", { page: 1 }] });
useQuery({ queryKey: ["users", { page: 1 }] }); // 复用前一个查询
```

### 2. 条件查询
```typescript
useQuery({
  queryKey: ["user", userId],
  queryFn: () => getUserById(userId),
  enabled: !!userId, // 只有当userId存在时才执行查询
});
```

### 3. 并行查询
```typescript
const usersQuery = useQuery({ queryKey: ["users"] });
const factoriesQuery = useQuery({ queryKey: ["factories"] });

// 或使用 useQueries
const results = useQueries({
  queries: [
    { queryKey: ["users"], queryFn: fetchUsers },
    { queryKey: ["factories"], queryFn: fetchFactories },
  ],
});
```

## 测试策略

### 1. 单元测试
```typescript
// 使用 @testing-library/react-hooks
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

test("should fetch users", async () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const { result } = renderHook(() => useUsersQuery(), { wrapper });

  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
```

### 2. Mock API
```typescript
jest.mock("../api/user", () => ({
  userApi: {
    getUsers: jest.fn(),
    createSalesperson: jest.fn(),
  },
}));
```

## 扩展指南

### 1. 添加新模块
1. 在契约层添加类型定义
2. 创建 API 函数
3. 创建 React Query hooks
4. 创建复合业务 hooks
5. 更新组件使用

### 2. 修改现有模块
1. 更新契约层类型
2. 更新 API 函数
3. 更新 hooks
4. 确保向后兼容

## 相关资源

- [React Query 官方文档](https://tanstack.com/query/latest)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [契约层设计文档](../packages/contract/README.md)