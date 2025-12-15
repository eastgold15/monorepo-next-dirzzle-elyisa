// 角色相关类型定义
// 包含角色管理和权限相关的类型

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { roleTable } from "../../table.schema";

// === 基础 Schema ===
const Insert = createInsertSchema(roleTable);
const Update = createUpdateSchema(roleTable);
const Select = createSelectSchema(roleTable);

// === 业务 Schema ===
const Create = t.Omit(Insert, ["id", "createdAt", "updatedAt"]);
const Patch = t.Partial(t.Omit(Update, ["id", "createdAt", "updatedAt"]));

// 角色查询参数
const Query = t.Object({
  name: t.Optional(t.String()),
  description: t.Optional(t.String()),
});

// 角色实体（包含权限列表）
const EntityWithPermissions = t.Composite([
  Select,
  t.Object({
    permissions: t.Array(t.String()),
  }),
]);

// === 运行时 Schema 集合 ===
export const RoleTModel = {
  Insert,
  Update,
  Select,
  Create,
  Patch,
  Query,
  EntityWithPermissions,
} as const;

// === 编译时类型集合 ===
export type RoleTModel = {
  Insert: typeof Insert.static;
  Update: typeof Update.static;
  Select: typeof Select.static;
  Create: typeof Create.static;
  Patch: typeof Patch.static;
  Query: typeof Query.static;
  EntityWithPermissions: typeof EntityWithPermissions.static;
};

// 角色类型
export type Role = typeof Select.static;

// 角色带权限类型
export type RoleWithPermissions = typeof EntityWithPermissions.static;
