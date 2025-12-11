# Model 定义标准文档

本文档定义了项目中所有模块 Model 的标准格式和规范。所有新建模块都必须遵循此标准。

## 概述

Model 文件基于 Drizzle-Zod，定义了业务层的各种 Schema 和类型，是前后端类型共享的核心。Model 采用分层设计理念，从数据库层到展示层逐层抽象。

## 核心概念：UpdateBase vs Update

    ### UpdateBase（数据库更新层）
  - **定义**：直接从 `createUpdateSchema` 生成，包含所有可更新字段
- **用途**：数据库层面的更新操作，内部逻辑使用
- **特点**：包含所有业务字段，不受前端接口限制

### Update（业务更新层）全量更新
- **定义**：基于 `UpdateBase`，排除系统管理字段（id, createdAt, updatedAt）
- **用途**：业务层面的全量更新，API 接口使用
- **特点**：面向业务的更新结构，更安全和友好

### Patch（部分更新层）部分更新
- **定义**：基于 `UpdateBase`，排除系统字段，所有字段可选
- **用途**：业务层面的部分更新，用于 PATCH 接口
- **特点**：灵活的部分更新，支持更新单个或多个字段

## 标准模板结构

```typescript
/**
 * [模块名称]模型定义
 * [模块描述]
 */

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { PaginationParams, SortParams } from "../helper/query-types";
import { [tableName] } from "./[module].schema";

// ===== 第一层：基础 Schema（数据库层） =====
// 直接映射数据库表结构，由 Drizzle-Zod 自动生成

// Insert: 插入数据 Schema，包含所有字段
const Insert = createInsertSchema([tableName]);

// UpdateBase: 基础更新 Schema，包含所有可更新字段
const UpdateBase = createUpdateSchema([tableName]);

// Select: 查询结果 Schema，完整的实体结构
const Select = createSelectSchema([tableName]);

// ===== 第二层：业务 Schema（应用层） =====
// 基于基础 Schema，根据业务需求进行裁剪和扩展

// Create: 创建 Schema，排除自动生成字段
const Create = Insert.omit({
  id: true,          // 排除自动生成的主键
  createdAt: true,   // 排除自动管理的创建时间
  updatedAt: true,   // 排除自动管理的更新时间
}).extend({
  // 业务扩展字段（可选）
  // 例如：确认密码、临时数据等不入库的字段
});

// Update: 业务更新 Schema，用于全量更新
const Update = UpdateBase.omit({
  id: true,          // 排除不可更新的主键
  createdAt: true,   // 排除不可变的创建时间
  updatedAt: true,   // 排除自动管理的更新时间
}).extend({
  // 业务扩展字段（可选）
  // 例如：关联数据的 ID 数组等
});

// Patch: 部分更新 Schema，所有字段可选
const Patch = UpdateBase.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();  // .partial() 使所有字段变为可选

// ===== 第三层：查询 Schema（查询层） =====

// BusinessQuery: 业务查询参数
const BusinessQuery = z.object({
  search: z.string().optional(),        // 搜索关键字
  status: z.enum(['active', 'inactive']).optional(),  // 状态筛选
  parentId: z.string().optional(), // 父级筛选
  // 其他业务筛选字段...
});

// ListQuery: 列表查询 Schema，包含分页和排序
const ListQuery = BusinessQuery
  .extend(PaginationParams.shape)       // 扩展分页参数
  .extend(SortParams.shape);            // 扩展排序参数

// ===== 第四层：视图 Schema（展示层） =====

// Entity: 实体视图 Schema，用于返回给前端
const Entity = Select.extend({
  // 视图扩展字段（可选）
  // 例如：计算字段、格式化字段、关联数据等
  fullName: z.string().optional(),
  isActive: z.boolean().optional(),
});

// EntityLocalized: 多语言视图 Schema（如需要）
const EntityLocalized = Entity.extend({
  // 多语言字段处理
  name: z.string(),        // 从 JSON 转换为字符串
  description: z.string(), // 从 JSON 转换为字符串
});

// ===== 特殊业务 Schema =====
// 根据具体业务需求定义的专用 Schema

// 批量操作
const BatchDelete = z.object({
  ids: z.array(z.string()).min(1, "至少选择一项"),
});

const BatchUpdate = z.object({
  ids: z.array(z.string()).min(1, "至少选择一项"),
  data: Patch,  // 使用 Patch Schema 作为更新数据
});

// 文件上传
const UploadFileDto = z.object({
  file: z.any(),
  folder: z.string().optional(),
  isPublic: z.boolean().default(true),
});

// 特定业务操作
const CustomOperation = z.object({
  // 根据业务需求定义
});

// ===== 枚举定义（如需要） =====
export const StatusEnum = z.enum(['active', 'inactive', 'pending']);
export type StatusEnum = z.infer<typeof StatusEnum>;

// ===== 值聚合导出（运行时 Schema） =====
export const [ModelName] = {
  // 基础 Schema
  Insert,        // 插入
  UpdateBase,    // 基础更新（内部使用）
  Update,        // 业务更新（API 使用）
  Select,        // 查询结果

  // 业务 Schema
  Create,        // 创建
  Patch,         // 部分更新
  ListQuery,     // 列表查询
  Entity,        // 实体视图
  BusinessQuery, // 业务查询

  // 特殊 Schema
  BatchDelete,   // 批量删除
  BatchUpdate,   // 批量更新
  UploadFileDto, // 文件上传
  CustomOperation, // 自定义操作

  // 枚举
  StatusEnum,
} as const;

// ===== 类型聚合导出（编译时类型） =====
export type [ModelName] = {
  // 基础类型
  Insert: z.infer<typeof Insert>;
  UpdateBase: z.infer<typeof UpdateBase>;  // 注意：保留此类型供内部使用
  Update: z.infer<typeof Update>;
  Select: z.infer<typeof Select>;

  // 业务类型（输入类型）
  CreateInput: z.infer<typeof Create>;
  UpdateInput: z.infer<typeof Update>;
  PatchInput: z.infer<typeof Patch>;
  ListQueryInput: z.infer<typeof ListQuery>;
  BusinessQueryInput: z.infer<typeof BusinessQuery>;

  // 视图类型
  Entity: z.infer<typeof Entity>;
  EntityLocalized: z.infer<typeof EntityLocalized>;

  // 特殊操作类型
  BatchDeleteInput: z.infer<typeof BatchDelete>;
  BatchUpdateInput: z.infer<typeof BatchUpdate>;
  UploadFileInput: z.infer<typeof UploadFileDto>;
  CustomOperationInput: z.infer<typeof CustomOperation>;

  // 枚举类型
  StatusEnum: z.infer<typeof StatusEnum>;
};

```

## 命名规范

### Schema 命名
- **基础层**：`Insert`, `UpdateBase`, `Select`
- **业务层**：`Create`, `Update`, `Patch`, `ListQuery`, `Entity`
- **特殊层**：`BatchXxx`, `UploadXxx`, `CustomXxx`
- **枚举**：`XxxEnum`

### 类型命名
- **输入类型**：`XxxInput`（如 `CreateInput`, `UpdateInput`）
- **查询类型**：`XxxQuery`（如 `ListQuery`）
- **实体类型**：`Xxx` 或 `Entity`
- **操作类型**：`XxxInput`（如 `BatchDeleteInput`）

## 扩展指南

### 1. 添加新的业务 Schema
```typescript
// 在特殊业务 Schema 区域添加
const SpecialQuery = z.object({
  specialField: z.string(),
});

// 记得添加到导出对象
export const [ModelName] = {
  // ... 其他 Schema
  SpecialQuery,
} as const;
```

### 2. 处理复杂验证
```typescript
const Create = Insert.omit({...}).extend({
  password: z.string().min(6),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "密码不一致",
  path: ["confirmPassword"],
});
```

### 3. 处理关联数据
```typescript
const Create = Insert.omit({...}).extend({
  // 关联数据的 ID 数组
  categoryIds: z.array(z.string()).optional(),
  imageIds: z.array(z.string()).optional(),
});
```

## 最佳实践

1. **保持分层清晰**：每层有明确的职责，不要混用
2. **UpdateBase 仅供内部使用**：对外 API 优先使用 Update 和 Patch
3. **合理使用 omit 和 extend**：根据业务需求灵活组合
4. **添加必要的验证**：在业务层添加数据验证规则
5. **保持命名一致**：遵循项目的命名规范
6. **添加注释**：为复杂的 Schema 添加说明注释

## 注意事项

1. **不要在前端直接使用 UpdateBase**：UpdateBase 可能包含敏感字段
2. **Patch 不是 Create**：Patch 用于更新，Create 用于创建
3. **Entity 是最终视图**：应该包含前端展示需要的所有数据
4. **保持 Schema 同步**：修改 Schema 后要考虑对现有代码的影响
5. **合理使用 refine**：复杂验证逻辑使用 refine 实现

## 示例参考

可以参考项目中的以下文件：
- `media.model.ts` - 最完整的实现示例
- `site-config.model.ts` - 简洁清晰的实现
- `category.model.ts` - 树形结构的实现

这些文件都严格遵循了本规范，可以作为新建模块的参考模板。