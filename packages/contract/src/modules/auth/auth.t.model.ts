// Auth module TypeBox type definitions
// Replaces Zod with TypeBox for runtime validation and type safety

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { usersTable } from "~/table.schema";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";

// === 基础 Schema ===
const Insert = createInsertSchema(usersTable);
const Update = createUpdateSchema(usersTable);
const Select = createSelectSchema(usersTable);

// === 业务 Schema ===
const Create = t.Omit(Insert, ["id", "createdAt", "updatedAt"]);

const Patch = t.Partial(
  t.Omit(Update, ["id", "createdAt", "updatedAt", "password"])
); // 通过专门的接口修改密码

const BusinessQuery = t.Object({
  username: t.Optional(t.String()),
  email: t.Optional(t.String({ format: "email" })),
  isActive: t.Optional(t.Boolean()),
});

const ListQuery = t.Object({
  ...BusinessQuery.properties,
  ...PaginationParams.properties,
  ...SortParams.properties,
});

const Entity = t.Omit(Select, ["password", "id", "createdAt", "updatedAt"]); // 不返回密码字段

// 扩展用户实体，包含权限信息
const EntityWithPermissions = t.Composite([
  Entity,
  t.Object({
    role: t.Union([
      t.Literal("exporter_admin"),
      t.Literal("factory_admin"),
      t.Literal("salesperson"),
    ]),
    exporterId: t.Optional(t.String()),
    factoryId: t.Optional(t.String()),
    salespersonId: t.Optional(t.String()),
    dataScope: t.Object({
      products: t.Union([
        t.Literal("all"),
        t.Literal("factory"),
        t.Literal("own"),
      ]),
      users: t.Union([
        t.Literal("all"),
        t.Literal("factory"),
        t.Literal("own"),
      ]),
      factories: t.Union([t.Literal("all"), t.Literal("own")]),
      orders: t.Union([
        t.Literal("all"),
        t.Literal("factory"),
        t.Literal("own"),
      ]),
    }),
  }),
]);

// === 1. 运行时 Schema 集合（值）===
export const AuthTModel = {
  Insert,
  Update,
  Select,
  Create,
  Patch,
  ListQuery,
  Entity,
  EntityWithPermissions,
  BusinessQuery,
} as const;

// === 2. 编译时类型集合（类型）===
export type AuthTModel = {
  Insert: typeof Insert.static;
  Update: typeof Update.static;
  Select: typeof Select.static;
  Create: typeof Create.static;
  Patch: typeof Patch.static;
  ListQuery: typeof ListQuery.static;
  Entity: typeof Entity.static;
  EntityWithPermissions: typeof EntityWithPermissions.static;
  BusinessQuery: typeof BusinessQuery.static;
};

// 导出扩展的用户类型
export type UserWithPermissions = AuthTModel["EntityWithPermissions"];
