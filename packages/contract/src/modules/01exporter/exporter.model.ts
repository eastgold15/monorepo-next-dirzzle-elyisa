/**
 * 出口商（Exporter）Model定义
 * 在 contract 包中定义，供前后端共享
 */

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { PaginationParams, SortParams } from "../helper/query-types";
import { exportersTable } from "./exporter.schema";

// === 基础 Schema ===
const Insert = createInsertSchema(exportersTable);
const UpdateBase = createUpdateSchema(exportersTable);
const Select = createSelectSchema(exportersTable);

// === 业务 Schema ===
const Create = Insert.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const Update = UpdateBase.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const Patch = UpdateBase.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

const BusinessQuery = z.object({
  name: z.coerce.string().optional(),
  code: z.coerce.string().optional(),
  isActive: z.coerce.boolean().optional(),
  isVerified: z.coerce.boolean().optional(),
  search: z.optional(z.coerce.string()),
});

const ListQuery = BusinessQuery.extend(PaginationParams.shape).extend(
  SortParams.shape
);

const Entity = Select;

// === 枚举定义 ===
export const ExporterStatusEnum = z.enum(["active", "inactive", "pending"]);

// === 特殊业务 Schema ===
const BatchDelete = z.object({
  ids: z.array(z.string()).min(1, "至少选择一个出口商"),
});

const StatusUpdate = z.object({
  id: z.string(),
  isActive: z.boolean(),
});

// === 1. 运行时 Schema 集合（值）===
export const ExporterModel = {
  Insert,
  UpdateBase,
  Update,
  Select,
  Create,
  Patch,
  BusinessQuery,
  ListQuery,
  Entity,
  BatchDelete,
  StatusUpdate,
  ExporterStatusEnum,
} as const;

// === 2. 编译时类型集合（类型）===
export type ExporterModel = {
  Insert: z.infer<typeof Insert>;
  UpdateBase: z.infer<typeof UpdateBase>;
  Update: z.infer<typeof Update>;
  Select: z.infer<typeof Select>;
  Create: z.infer<typeof Create>;
  Patch: z.infer<typeof Patch>;
  BusinessQuery: z.infer<typeof BusinessQuery>;
  ListQuery: z.infer<typeof ListQuery>;
  Entity: z.infer<typeof Entity>;
  BatchDelete: z.infer<typeof BatchDelete>;
  StatusUpdate: z.infer<typeof StatusUpdate>;
  ExporterStatusEnum: z.infer<typeof ExporterStatusEnum>;
};
