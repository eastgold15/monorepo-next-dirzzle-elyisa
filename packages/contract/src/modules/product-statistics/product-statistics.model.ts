import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { PaginationParams, SortParams } from "../helper/query-types";
import { productStatisticsTable } from "./product-statistics.schema";

// === 枚举 ===
const StatisticsType = z.enum(["view", "search", "favorite"]);
const Period = z.enum(["today", "week", "month", "year"]);

// === 基础 Schema ===
const Insert = createInsertSchema(productStatisticsTable);
const Update = createUpdateSchema(productStatisticsTable);
const Select = createSelectSchema(productStatisticsTable);

// === 业务 Schema ===
const Create = Insert.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const Patch = Update.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

const BusinessQuery = z.object({
  productId: z.string().optional(),
  statisticsType: StatisticsType.optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "开始日期格式必须为YYYY-MM-DD")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "结束日期格式必须为YYYY-MM-DD")
    .optional(),
});

const ListQuery = BusinessQuery.extend(PaginationParams.shape).extend(
  SortParams.shape
);

const Entity = Select.extend({
  productName: z.string().optional(), // 关联商品名称
  productImageUrl: z.string().url().optional(), // 关联商品图片
});

// 统计相关的特殊 Schema
const OverviewQuery = z.object({
  productId: z.string().optional(), // 可选，单个商品的概览
});

const PopularProductsQuery = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  period: Period.default("week"),
  statisticsType: StatisticsType.default("view"),
});

const BatchIncrement = z.array(
  z.object({
    productId: z.string(),
    statisticsType: StatisticsType,
    count: z.coerce.number().default(1),
  })
);

// === 1. 运行时 Schema 集合（值）===
export const ProductStatisticsModel = {
  Insert,
  Update,
  Select,
  Create,
  Patch,
  ListQuery,
  Entity,
  OverviewQuery,
  PopularProductsQuery,
  BatchIncrement,
  StatisticsType,
  Period,
  BusinessQuery,
} as const;

// === 2. 编译时类型集合（类型）===
export type ProductStatisticsModel = {
  Insert: z.infer<typeof Insert>;
  Update: z.infer<typeof Update>;
  Select: z.infer<typeof Select>;
  Create: z.infer<typeof Create>;
  Patch: z.infer<typeof Patch>;
  ListQuery: z.infer<typeof ListQuery>;
  Entity: z.infer<typeof Entity>;
  OverviewQuery: z.infer<typeof OverviewQuery>;
  PopularProductsQuery: z.infer<typeof PopularProductsQuery>;
  BatchIncrement: z.infer<typeof BatchIncrement>;
  StatisticsType: z.infer<typeof StatisticsType>;
  Period: z.infer<typeof Period>;
  BusinessQuery: z.infer<typeof BusinessQuery>;
};
