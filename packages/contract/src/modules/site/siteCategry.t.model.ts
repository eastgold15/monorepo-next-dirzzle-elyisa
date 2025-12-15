
import {
  siteCategoriesTable,
} from "@repo/contract/table";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";

const Insert = createInsertSchema(siteCategoriesTable);
const Update = createUpdateSchema(siteCategoriesTable);
const Select = createSelectSchema(siteCategoriesTable);

const Entity = Select
export const SiteCategoryTModel = {
  // Schema types
  Insert,
  Update,
  Select,
  Entity
}

