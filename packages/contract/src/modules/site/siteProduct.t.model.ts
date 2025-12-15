import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { siteProductsTable } from "../../table.schema";

// Site Product Model Types
const Insert = createInsertSchema(siteProductsTable);

const Update = createUpdateSchema(siteProductsTable);
const Select = createSelectSchema(siteProductsTable);

export const SiteProductTModel = {
  // Schema types
  Insert,
  Update,
  Select,
};
