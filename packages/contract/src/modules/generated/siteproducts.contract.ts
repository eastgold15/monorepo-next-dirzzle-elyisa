import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { siteProductsTable } from "../../table.schema";
import { PaginationParams, SortParams } from "~/helper/query-types.t.model";

const _Select = createSelectSchema(siteProductsTable);
const _Insert = createInsertSchema(siteProductsTable);

export const SiteProductsContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(siteProductsTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type SiteProductsDTO = {
  Response: typeof SiteProductsContract.Response.static;
  Create: typeof SiteProductsContract.Create.static;
  Update: typeof SiteProductsContract.Update.static;
  Patch: typeof SiteProductsContract.Patch.static;
  ListQuery: typeof SiteProductsContract.ListQuery.static;
};
