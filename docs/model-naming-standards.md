# Model 文件命名规范（最终版）

## 概述
总结 Model 文件的标准命名和结构规范。

## 核心原则

### 1. 命名约定

#### 变量命名（无前缀）
```typescript
// ✅ 正确 - 变量名不带任何前缀
const Insert = createInsertSchema(table);
const Create = Insert.omit({ id: true, createdAt: true, updatedAt: true });
const Update = UpdateBase.omit({ id: true, createdAt: true, updatedAt: true });
const Patch = UpdateBase.omit({ id: true, createdAt: true, updatedAt: true }).partial();

// ❌ 错误 - 变量名带前缀
const InquiryInsert = createInsertSchema(inquiryTable);
```

#### 导出对象键命名（无前缀）
```typescript
// ✅ 正确 - 导出对象的键不带前缀
export const InquiryModel = {
  Insert,  // 键和值都不带前缀
  Create,
  Update,
  Patch,
} as const;

// ❌ 错误 - 导出对象的键带前缀
export const InquiryModel = {
  InquiryInsert: Insert,
  InquiryCreate: Create,
  InquiryUpdate: Update,
  InquiryPatch: Patch,
} as const;
```

#### 枚举命名（必须有前缀）
```typescript
// ✅ 正确 - 枚举必须有前缀
export const InquiryStatusEnum = z.enum(["pending", "sent", "completed"]);
export const SalesRepStatusEnum = z.enum(["active", "inactive"]);

// ❌ 错误 - 枚举不带前缀
export const StatusEnum = z.enum(["pending", "sent", "completed"]);
```

### 2. 导出结构规范

#### 值聚合导出（运行时 Schema）
```typescript
export const XxxModel = {
  // 基础 Schema（无前缀）
  Insert,
  UpdateBase,
  Update,
  Select,

  // 业务 Schema（无前缀）
  Create,
  Update,
  Patch,
  ListQuery,
  Entity,
  Brief,
  BusinessQuery,

  // 特殊 Schema（无前缀）
  BatchDelete,
  BatchUpdate,
  StatusUpdate,
  EmailSend,

  // 枚举（必须有前缀）
  XxxStatusEnum,
  XxxTypeEnum,
} as const;
```

#### 类型聚合导出（编译时类型）
```typescript
export type XxxModel = {
  // 基础类型（无前缀）
  Insert: z.infer<typeof Insert>;
  UpdateBase: z.infer<typeof UpdateBase>;
  Update: z.infer<typeof Update>;
  Select: z.infer<typeof Select>;

  // 业务类型（无后缀）
  Create: z.infer<typeof Create>;
  Update: z.infer<typeof Update>;
  Patch: z.infer<typeof Patch>;
  ListQuery: z.infer<typeof ListQuery>;
  BusinessQuery: z.infer<typeof BusinessQuery>;

  // 视图类型（无前缀无后缀）
  Entity: z.infer<typeof Entity>;
  Brief: z.infer<typeof Brief>;

  // 特殊操作类型（无后缀）
  BatchDelete: z.infer<typeof BatchDelete>;
  BatchUpdate: z.infer<typeof BatchUpdate>;
  StatusUpdate: z.infer<typeof StatusUpdate>;
  EmailSend: z.infer<typeof EmailSend>;

  // 枚举类型（必须有前缀）
  XxxStatusEnum: z.infer<typeof XxxStatusEnum>;
  XxxTypeEnum: z.infer<typeof XxxTypeEnum>;
};
```

### 3. 特殊业务 Schema 命名

#### 批量操作
```typescript
// 变量命名（无前缀）
const BatchDelete = z.object({
  ids: z.array(z.string()).min(1, "至少选择一个"),
});

const BatchUpdate = z.object({
  ids: z.array(z.string()).min(1, "至少选择一个"),
  data: Patch,
});

// 导出时键不带前缀
export const XxxModel = {
  BatchDelete,
  BatchUpdate,
}
```

#### 状态更新
```typescript
const StatusUpdate = z.object({
  status: z.enum(["pending", "sent", "completed"]),
  emailSent: z.boolean().optional(),
});

// 导出
export const XxxModel = {
  StatusUpdate,
}
```

#### 邮件相关
```typescript
const EmailSend = z.object({
  inquiryId: z.number().int(),
  recipientEmail: z.string().email(),
  subject: z.string().optional(),
  includeExcel: z.boolean().default(true),
});

const EmailInfo = Select.pick({...}).extend({
  inquiryNumber: z.string(),
  itemCount: z.number(),
});

// 导出
export const XxxModel = {
  EmailSend,
  EmailInfo,
}
```

#### 文件上传
```typescript
const LogoUpload = z.object({
  id: z.string(),
  file: z.any(),
  folder: z.string().default("logos"),
});

// 导出
export const XxxModel = {
  LogoUpload,
}
```

### 4. 跨模块引用

当需要引用其他模块的 Schema 时：

```typescript
// inquiry.model.ts 引用 inquiryItem.model.ts
import { InquiryItemModel } from "./inquiryItem.model";

const CreateWithItems = Create.extend({
  items: z.array(InquiryItemModel.Create).min(1, "至少需要询价一个商品"),
});

const Entity = Select.extend({
  items: z.array(InquiryItemModel.Select).default([]),
});
```

### 5. 模块拆分原则

当一个模块包含主表和子表时：

- 主表模型：`xxx.model.ts`（如 `inquiry.model.ts`）
- 子表模型：`xxxItem.model.ts` 或 `xxxSub.model.ts`（如 `inquiryItem.model.ts`）
- 每个文件都遵循相同的命名规范
- 通过 import 引入关联的 Schema

### 6. 关键规则总结

| 类型 | 变量命名 | 导出键命名 | 枚举命名 | 类型后缀 |
|------|----------|------------|----------|----------|
| 基础Schema | 无前缀 | 无前缀 | N/A | 无 |
| 业务Schema | 无前缀 | 无前缀 | N/A | 无 |
| 查询Schema | 无前缀 | 无前缀 | N/A | 无 |
| 视图Schema | 无前缀 | 无前缀 | N/A | 无 |
| 特殊Schema | 无前缀 | 无前缀 | N/A | 无 |
| 枚举 | 带前缀 | 带前缀 | 带前缀 | Enum |



### 8. 示例对比

#### ❌ 错误示例
```typescript
// 变量带前缀 - 错误
const InquiryInsert = createInsertSchema(inquiryTable);
const InquiryBatchDelete = z.object({...});

// 导出键带前缀 - 错误
export const InquiryModel = {
  InquiryInsert: Insert,
  InquiryBatchDelete: BatchDelete,
}

// 类型带Input后缀 - 错误
export type InquiryModel = {
  CreateInput: z.infer<typeof Create>;
  UpdateInput: z.infer<typeof Update>;
}

// 默认导出 - 错误
export default InquiryModel;
```

#### ✅ 正确示例
```typescript
// 变量不带前缀 - 正确
const Insert = createInsertSchema(inquiryTable);
const BatchDelete = z.object({...});

// 导出键不带前缀 - 正确
export const InquiryModel = {
  Insert,
  BatchDelete,
}

// 类型不带Input后缀 - 正确
export type InquiryModel = {
  Create: z.infer<typeof Create>;
  Update: z.infer<typeof Update>;
}

// 不使用默认导出 - 正确
// export default InquiryModel; // 删除这行
```


## 实际案例

参考以下文件的标准实现：
- `packages/contract/src/modules/inquiry/inquiry.model.ts`
- `packages/contract/src/modules/inquiry/inquiryItem.model.ts`
- `packages/contract/src/modules/merchant/merchant.model.ts`
- `packages/contract/src/modules/merchant/sales_rep.model.ts`

这些文件展示了完美的命名规范实现。