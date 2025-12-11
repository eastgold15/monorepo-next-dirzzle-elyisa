// Auth module TypeBox type definitions
// Replaces Zod with TypeBox for runtime validation and type safety

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";
import { usersTable } from "./auth.schema";

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

const Entity = t.Omit(Select, ["password", 'id', 'createdAt', 'updatedAt']); // 不返回密码字段



// === 1. 运行时 Schema 集合（值）===
export const AuthTModel = {
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
export type AuthTModel = {
  Insert: typeof Insert.static;
  Update: typeof Update.static;
  Select: typeof Select.static;
  Create: typeof Create.static;
  Patch: typeof Patch.static;
  ListQuery: typeof ListQuery.static;
  Entity: typeof Entity.static;
  BusinessQuery: typeof BusinessQuery.static;
};
