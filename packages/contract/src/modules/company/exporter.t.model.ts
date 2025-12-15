/**
 * 出口商（Exporter）Model定义
 * 在 contract 包中定义，供前后端共享
 */

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { exportersTable } from "~/table.schema";


// === 基础 Schema ===
const Insert = createInsertSchema(exportersTable);
const UpdateBase = createUpdateSchema(exportersTable);
const Select = createSelectSchema(exportersTable);

const Entity = t.Omit(Select, ["id", "updatedAt"]);

// === 1. 运行时 Schema 集合（值）===
export const ExporterTModel = {
  Insert,
  UpdateBase,
  Select,
  Entity,
} as const;

// === 2. 编译时类型集合（类型）===
export type ExporterTModel = {
  Insert: typeof Insert.static;
  Select: typeof Select.static;
  UpdateBase: typeof UpdateBase.static;
  Entity: typeof Entity.static;
};
