# xxx.model.ts 文件规范
作用：定义完整的类型系统和业务验证 Schema
  核心结构：

  // module_name.model.ts

  // 1. 导入依赖
  import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
  import { z } from "zod/v4";
  import { moduleNameTable } from "./module_name.schema";

  // 2. 基础 Zod Schema（基于 Drizzle 表生成）
  const Insert = createInsertSchema(moduleNameTable);
  const Update = createUpdateSchema(moduleNameTable);
  const Select = createSelectSchema(moduleNameTable);

  // 3. 业务 DTO Schema
  const Create = Insert.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });
  const Patch = Update.partial();
  const ListQuery = z.object({
    page: z.string().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    // 其他查询参数...
  });
  const Entity = Select.omit({})


  // 4. TypeScript 类型定义
  type EntityInput = z.infer<typeof Entity>;
  type CreateInput = z.infer<typeof Create>;
  type UpdateInput = z.infer<typeof Update>;
  type PatchInput = z.infer<typeof Patch>;
  type ListQueryInput = z.infer<typeof ListQuery>;

  // 5. 值聚合 - 包含所有 Schema（必须使用 as const）
  export const ModuleNameModel = {
    // Schema 相关
    Insert,
    Update,
    Select,
    Create,
    Patch,
    ListQuery,
    Entity
    // 枚举和其他常量
  } as const;

  // 6. 类型聚合 - 包含所有类型
  export type ModuleNameModel = {
    EntityInput: EntityInput;
    CreateInput: CreateInput;
    UpdateInput: UpdateInput;
    PatchInput: PatchInput;
    ListQueryInput: ListQueryInput;
  };

  关键规范：
  - 值导出使用 export const ModuleNameModel = { ... } as const
  - 类型导出使用 export type ModuleNameModel = { ... }
  - 同名导出：值和类型都使用相同的名称 ModuleNameModel



  前端的handapi在定义对象聚合接口的时候，需要使用我们定义的model 类型，主要是传参使用xxxinput


  去除所有的viewObject ，改用entity ，但是这个entity 不能直接来自select 而是链表查询之后的entity  entityinput

  entity 由select 扩展 ，类型有entity变成entityinput

  没有数据库表的model 不需要遵守这个