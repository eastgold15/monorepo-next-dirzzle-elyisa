import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { PaginationParams, SortParams } from "../helper/query-types";
import { skusTable } from "./sku.schema";

// === 基础 Schema ===
const Insert = createInsertSchema(skusTable);
const UpdateBase = createUpdateSchema(skusTable, {});
const Select = createSelectSchema(skusTable);

// === 业务 Schema ===
const Create = Insert.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  imageId: true,
}).extend({
  imageId: z.array(z.string()),
  specJson: z.record(z.string(), z.string()),
  extraAttributes: z.record(z.string(), z.any()).optional(),
});

const Update = UpdateBase.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  imageId: true,
}).extend({
  imageId: z.array(z.string()),
  specJson: z.record(z.string(), z.string()),
  extraAttributes: z.record(z.string(), z.any()).optional(),
});

const Patch = UpdateBase.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  imageId: z.array(z.string()).optional(),
  extraAttributes: z.record(z.string(), z.any()).optional(),
});

const BusinessQuery = z.object({
  search: z.string().optional(),
  productId: z.string().optional(),
  status: z.coerce.number().optional(),
  skuCode: z.string().optional(),
});

const ListQuery = BusinessQuery.extend(PaginationParams.shape).extend(
  SortParams.shape
);

const Entity = Select.extend({
  specJson: z.record(z.string(), z.string()).optional(),
  extraAttributes: z.record(z.string(), z.any()).optional(),
  imageId: z.array(z.string()),
});

const BatchCreate = z.array(
  z.object({
    skuCode: z.string(),
    price: z.string(),
    stock: z.string().optional(),
    specJson: z.record(z.string(), z.string()),
  })
);

// === 1. 运行时 Schema 集合（值）===
export const SkuModel = {
  Insert,
  Update,
  Select,
  Create,
  Patch,
  ListQuery,
  Entity,
  BatchCreate,
  BusinessQuery,
} as const;

// === 2. 编译时类型集合（类型）===
export type SkuModel = {
  Insert: z.infer<typeof Insert>;
  Update: z.infer<typeof Update>;
  Select: z.infer<typeof Select>;
  Create: z.infer<typeof Create>;
  Patch: z.infer<typeof Patch>;
  ListQuery: z.infer<typeof ListQuery>;
  Entity: z.infer<typeof Entity>;
  BatchCreate: z.infer<typeof BatchCreate>;
  BusinessQuery: z.infer<typeof BusinessQuery>;
};
