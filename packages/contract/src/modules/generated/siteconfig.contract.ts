import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { siteConfigTable } from "../../table.schema";
import { PaginationParams, SortParams } from "../../helper/query-types.model";

const _Select = createSelectSchema(siteConfigTable);
const _Insert = createInsertSchema(siteConfigTable);

export const SiteConfigContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(siteConfigTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type SiteConfigDTO = {
  Response: typeof SiteConfigContract.Response.static;
  Create: typeof SiteConfigContract.Create.static;
  Update: typeof SiteConfigContract.Update.static;
  Patch: typeof SiteConfigContract.Patch.static;
  ListQuery: typeof SiteConfigContract.ListQuery.static;
};
