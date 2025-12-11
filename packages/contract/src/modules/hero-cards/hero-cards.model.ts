import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { PaginationParams, SortParams } from "../helper/query-types";
import { heroCardsTable } from "./hero-cards.schema";

// === 基础 Schema ===
const Insert = createInsertSchema(heroCardsTable);
const UpdateBase = createUpdateSchema(heroCardsTable);
const Select = createSelectSchema(heroCardsTable);

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
  imageId: true,
})
  .extend({
    imageId: z.array(z.string()).optional(),
  })
  .partial();

const BusinessQuery = z.object({
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  position: z.string().optional(),
});

const ListQuery = BusinessQuery.extend(PaginationParams.shape).extend(
  SortParams.shape
);

const Entity = Select.omit({
  imageId: true,
}).extend({
  media: z.object({
    id: z.string(),
    fileName: z.string(),
    url: z.string(),
    alt: z.string(),
  }),
});

const BatchDelete = z.object({
  ids: z.array(z.string()).min(1, "请选择要删除的id"),
});

const BatchUpdate = z.object({
  ids: z.array(z.string()).min(1, "请选择要更新的项"),
  update: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    position: z.string().optional(),
    link: z.string().optional(),
  }),
});

// === 1. 运行时 Schema 集合（值）===
export const HeroCardsModel = {
  Insert,
  Update,
  Select,
  Create,
  Patch,
  ListQuery,
  Entity,
  BatchDelete,
  BatchUpdate,
  BusinessQuery,
} as const;

// === 2. 编译时类型集合（类型）===
export type HeroCardsModel = {
  Insert: z.infer<typeof Insert>;
  Update: z.infer<typeof Update>;
  Select: z.infer<typeof Select>;
  Create: z.infer<typeof Create>;
  Patch: z.infer<typeof Patch>;
  ListQuery: z.infer<typeof ListQuery>;
  Entity: z.infer<typeof Entity>;
  BatchDelete: z.infer<typeof BatchDelete>;
  BatchUpdate: z.infer<typeof BatchUpdate>;
  BusinessQuery: z.infer<typeof BusinessQuery>;
};
