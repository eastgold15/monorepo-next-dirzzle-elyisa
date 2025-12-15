import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { userSitePermissionsTable } from "~/table.schema";

// User Site Permission Model Types
const Insert = createInsertSchema(userSitePermissionsTable)
const Select = createSelectSchema(userSitePermissionsTable);

export const SitePermissionTModel = {
  // Schema types
  Insert,
  Select,
}


export type SitePermissionTModel = {
  Insert: typeof Insert,
  Select: typeof Select,
}