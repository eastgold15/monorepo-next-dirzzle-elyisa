import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { PaginationParams, SortParams } from "../helper/query-types";
import { adsTable } from "./ads.schema";

// === 基础 Schema ===
const Insert = createInsertSchema(adsTable);
const UpdateBase = createUpdateSchema(adsTable);
const Select = createSelectSchema(adsTable);

// === 业务 Schema ===
const Create = Insert.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  image_id: true,
  startDate: true,
  endDate: true,
}).extend({
  image_id: z.array(z.string()),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

const Update = UpdateBase.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  image_id: true,
  startDate: true,
  endDate: true,
}).extend({
  image_id: z.array(z.string()),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

const Patch = UpdateBase.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  image_id: true,
  startDate: true,
  endDate: true,
}).extend({
  image_id: z.array(z.string()).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

const BusinessQuery = UpdateBase.pick({
  type: true,
  position: true,
  isActive: true,
}).extend({
  search: z.string().optional(),
});

const ListQuery = BusinessQuery.extend(PaginationParams.shape).extend(
  SortParams.shape
);

const Entity = Select.extend({
  imageUrl: z.string().optional().nullable(),
});

const BatchStatusUpdate = z.object({
  ids: z.array(z.string()),
  isActive: z.boolean(),
});

// === 1. 运行时 Schema 集合（值）===
export const AdsModel = {
  Insert,
  Update,
  Select,
  Create,
  Patch,
  ListQuery,
  Entity,
  BatchStatusUpdate,
  BusinessQuery,
} as const;

// === 2. 编译时类型集合（类型）===
export type AdsModel = {
  Insert: z.infer<typeof Insert>;
  Update: z.infer<typeof Update>;
  Select: z.infer<typeof Select>;
  Create: z.infer<typeof Create>;
  Patch: z.infer<typeof Patch>;
  ListQuery: z.infer<typeof ListQuery>;

  Entity: z.infer<typeof Entity>;
  BatchStatusUpdate: z.infer<typeof BatchStatusUpdate>;
  BusinessQuery: z.infer<typeof BusinessQuery>;
};
