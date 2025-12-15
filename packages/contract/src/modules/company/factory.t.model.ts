// Factory module TypeBox type definitions
// Factory management

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { factoriesTable } from "~/table.schema";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";

// === 基础 Schema（直接复用数据库表结构生成的类型）===
const Insert = createInsertSchema(factoriesTable);
const UpdateBase = createUpdateSchema(factoriesTable);
const Select = createSelectSchema(factoriesTable);

// === 业务 Schema（基于基础类型扩展，避免重复定义）===
// 创建工厂时无需传入的字段（复用 Insert 类型并剔除自动生成的字段）
const Create = t.Omit(Insert, ["id", "createdAt", "updatedAt", "categoryId"]);

// 更新工厂时无需传入的字段（复用 UpdateBase 类型）
const Update = t.Omit(UpdateBase, ["id", "createdAt", "updatedAt"]);

// 部分更新（复用 Update 类型生成 Partial）
const Patch = t.Partial(Update);

// 业务查询参数（基于数据库字段定义查询条件）
const BusinessQuery = t.Object({
  name: t.Optional(t.String()),
  country: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
});

// 列表查询参数（合并业务查询、分页、排序参数）
const ListQuery = t.Intersect([BusinessQuery, PaginationParams, SortParams]);

const Entity = Select;

// === 1. 运行时 Schema 集合（值）===
export const FactoryTModel = {
  Insert,
  Update,
  Select,
  Create,
  Patch,
  ListQuery,
  Entity,
  BusinessQuery,
} as const;

// === 2. 编译时类型集合（类型）===
export type FactoryTModel = {
  Insert: typeof Insert.static;
  Update: typeof Update.static;
  Select: typeof Select.static;
  Create: typeof Create.static;
  Patch: typeof Patch.static;
  ListQuery: typeof ListQuery.static;
  Entity: typeof Entity.static;
  BusinessQuery: typeof BusinessQuery.static;
};

// === 3. 扩展业务类型（复用 FactoryTModel 中的基础类型）===

// 创建工厂和工厂管理员请求类型（复用 Create 类型中的工厂字段）
export const CreateFactoryWithAdminRequest = t.Object({
  // 工厂信息：复用 Create 类型的核心字段，补充分类ID数组（多对多关联）
  factory: t.Intersect([
    t.Pick(Create, [
      "name",
      "code",
      "description",
      "website",
      "address",
      "contactPhone",
      "logo",
      "businessLicense",
      "mainProducts",
      "annualRevenue",
      "employeeCount",
    ]),
    t.Object({
      categoryIds: t.Array(t.String({ format: "uuid" })), // 多分类关联（原表中是单categoryId，这里扩展为数组）
    }),
  ]),

  // 工厂管理员信息（保持不变，如需复用用户类型可进一步关联用户模块的Type）
  admin: t.Object({
    name: t.String({
      minLength: 1,
      maxLength: 200,
      description: "工厂管理员姓名",
    }),
    email: t.String({
      format: "email",
      description: "工厂管理员邮箱",
    }),
    password: t.String({
      minLength: 6,
      description: "工厂管理员密码",
    }),
    phone: t.String({
      minLength: 1,
      maxLength: 50,
      description: "工厂管理员电话",
    }),
  }),
});

// 创建工厂响应类型（复用 Select 类型的工厂字段）
export const CreateFactoryWithAdminResponse = t.Object({
  factory: t.Pick(Select, [
    "id",
    "name",
    "code",
    "website",
    "address",
    "isActive",
    "isVerified",
    "createdAt",
  ]),
  admin: t.Object({
    id: t.String(),
    name: t.String(),
    email: t.String(),
    role: t.Literal("factory_admin"),
  }),
});

// 导出扩展类型
export type CreateFactoryWithAdminRequest =
  typeof CreateFactoryWithAdminRequest.static;
export type CreateFactoryWithAdminResponse =
  typeof CreateFactoryWithAdminResponse.static;
