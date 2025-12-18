import { siteCategoriesTable } from "@repo/contract/table";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import type { TreeNode } from "../helper/utils.types";

const Insert = createInsertSchema(siteCategoriesTable);
const UpdateBase = createUpdateSchema(siteCategoriesTable)
const Select = createSelectSchema(siteCategoriesTable);

// 创建站点分类（siteId由服务端自动添加）
const Create = t.Intersect([
  t.Omit(Insert, ["id", "createdAt", "updatedAt", "siteId"])
]);

const Update = t.Omit(UpdateBase, ["id", "createdAt", "updatedAt", "siteId"])

const Entity = Select;

export const SiteCategoryTModel = {
  // Schema types
  Insert,
  Update,
  Select,
  Entity,
  Create,
};

export type SiteCategoryTModel = {
  Insert: typeof Insert.static;
  Update: typeof Update.static;
  Select: typeof Select.static;
  Entity: typeof Entity.static;
  Create: typeof Create.static;
  TreeEntity: TreeNode<typeof Entity.static>;
};
