// Master Category module TypeBox type definitions
// Replaces Zod with TypeBox for runtime validation and type safety

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import type { TreeNode } from "../../helper/utils.types";
import { masterTable } from "../../table.schema";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";

// === 基础 Schema ===
const Insert = createInsertSchema(masterTable);
const UpdateBase = createUpdateSchema(masterTable);
const Select = createSelectSchema(masterTable);

// === 业务 Schema ===
const Create = t.Omit(Insert, ["id", "createdAt", "updatedAt"]);

const Update = t.Omit(UpdateBase, ["id", "createdAt", "updatedAt"]);

const Patch = t.Partial(Update);

// 查询参数
const BusinessQuery = t.Object({
  search: t.Optional(t.String()),
  parentId: t.Optional(t.String()),
  isVisible: t.Optional(t.Boolean()),
});

const ListQuery = t.Object({
  ...BusinessQuery.properties,
  ...PaginationParams.properties,
  ...SortParams.properties,
});

const TreeQuery = t.Object({
  includeInvisible: t.Optional(t.Boolean()),
});

// 树形节点响应类型
const TreeEntity = t.Composite([
  Select,
  t.Object({
    children: t.Optional(t.Array(t.Any())), // 递归子节点
  }),
]);

// 分页响应类型
const PaginatedResponse = t.Object({
  items: t.Array(Select),
  meta: t.Object({
    total: t.Number(),
    page: t.Number(),
    limit: t.Number(),
    totalPages: t.Number(),
  }),
});

// === 1. 运行时 Schema 集合（值）===
export const MasterCategoryTModel = {
  Insert,
  Update,
  Select,
  Create,
  Patch,
  ListQuery,
  TreeQuery,
  Entity: Select,
  TreeEntity,
  BusinessQuery,
  PaginatedResponse,
} as const;

// === 2. 编译时类型集合（类型）===
export type MasterCategoryTModel = {
  Insert: typeof Insert.static;
  Update: typeof Update.static;
  Select: typeof Select.static;
  Create: typeof Create.static;
  Patch: typeof Patch.static;
  ListQuery: typeof ListQuery.static;
  TreeQuery: typeof TreeQuery.static;
  Entity: typeof Select.static;
  TreeEntity: TreeNode<typeof Select.static>;
  BusinessQuery: typeof BusinessQuery.static;
  PaginatedResponse: typeof PaginatedResponse.static;
};
