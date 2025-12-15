// Product Statistics module TypeBox type definitions
// Replaces Zod with TypeBox for runtime validation and type safety

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { productStatisticsTable } from "~/table.schema";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";

// === 枚举 ===
const StatisticsType = t.UnionEnum(["view", "search", "favorite"]);
const Period = t.UnionEnum(["today", "week", "month", "year"]);

// === 基础 Schema ===
const Insert = createInsertSchema(productStatisticsTable);
const Update = createUpdateSchema(productStatisticsTable);
const Select = createSelectSchema(productStatisticsTable);

// === 业务 Schema ===
const Create = t.Omit(Insert, ["id", "createdAt", "updatedAt"]);

const Patch = t.Partial(t.Omit(Update, ["id", "createdAt", "updatedAt"]));

const BusinessQuery = t.Object({
  productId: t.Optional(t.String()),
  statisticsType: t.Optional(StatisticsType),
  startDate: t.Optional(t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" })),
  endDate: t.Optional(t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" })),
});

const ListQuery = t.Object({
  ...BusinessQuery.properties,
  ...PaginationParams.properties,
  ...SortParams.properties,
});

const Entity = t.Object({
  ...Select.properties,
  productName: t.Optional(t.String()), // 关联商品名称
  productImageUrl: t.Optional(t.String({ format: "uri" })), // 关联商品图片
});

// 统计相关的特殊 Schema
const OverviewQuery = t.Object({
  productId: t.Optional(t.String()), // 可选，单个商品的概览
});


const BatchIncrement = t.Array(
  t.Object({
    productId: t.String(),
    statisticsType: StatisticsType,
    count: t.Optional(t.Number({ default: 1 })),
  })
);

// === 1. 运行时 Schema 集合（值）===
export const ProductStatisticsTModel = {
  Insert,
  Update,
  Select,
  Create,
  Patch,
  ListQuery,
  Entity,
  OverviewQuery,

  BatchIncrement,
  StatisticsType,
  Period,
  BusinessQuery,
} as const;

// === 2. 编译时类型集合（类型）===
export type ProductStatisticsTModel = {
  Insert: typeof Insert.static;
  Update: typeof Update.static;
  Select: typeof Select.static;
  Create: typeof Create.static;
  Patch: typeof Patch.static;
  ListQuery: typeof ListQuery.static;
  Entity: typeof Entity.static;
  OverviewQuery: typeof OverviewQuery.static;

  BatchIncrement: typeof BatchIncrement.static;
  StatisticsType: typeof StatisticsType.static;
  Period: typeof Period.static;
  BusinessQuery: typeof BusinessQuery.static;
};
