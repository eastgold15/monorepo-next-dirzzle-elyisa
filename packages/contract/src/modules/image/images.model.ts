import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { PaginationParams, SortParams } from "../helper/query-types";
import { imagesTable } from "./image.schema";

// === 基础 Schema ===
const Insert = createInsertSchema(imagesTable);
const Update = createUpdateSchema(imagesTable);
const Select = createSelectSchema(imagesTable);

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
  search: z.string().optional(),
  category: z.string().optional(),
  mimeType: z.string().optional(),
  filename: z.string().optional(),
});

const ListQuery = BusinessQuery.extend(PaginationParams.shape).extend(
  SortParams.shape
);

const Entity = Select.extend({
  url: z.string().url(), // 确保返回的是完整 URL
});

const BatchUpload = z.object({
  entityType: z.string(),
  entityId: z.string(),
  images: z.array(
    z.object({
      url: z.string().min(1, "图片URL不能为空"),
      imageType: z.string().optional(),
      sortOrder: z.coerce.number().default(0),
      altText: z.string().optional(),
    })
  ),
});

const BatchDelete = z.object({
  ids: z.array(z.string()).min(1, "请选择要删除的图片"),
});

// === 1. 运行时 Schema 集合（值）===
export const ImageModel = {
  Insert,
  Update,
  Select,
  Create,
  Patch,
  ListQuery,
  Entity,
  BatchUpload,
  BatchDelete,
  BusinessQuery,
} as const;

// === 2. 编译时类型集合（类型）===
export type ImageModel = {
  Insert: z.infer<typeof Insert>;
  Update: z.infer<typeof Update>;
  Select: z.infer<typeof Select>;
  Create: z.infer<typeof Create>;
  Patch: z.infer<typeof Patch>;
  ListQuery: z.infer<typeof ListQuery>;
  Entity: z.infer<typeof Entity>;
  BatchUpload: z.infer<typeof BatchUpload>;
  BatchDelete: z.infer<typeof BatchDelete>;
  BusinessQuery: z.infer<typeof BusinessQuery>;
};
