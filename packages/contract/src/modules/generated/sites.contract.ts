import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { sitesTable } from "~/table.schema";
import { PaginationParams, SortParams } from "~/helper/query-types.model";

const _Select = createSelectSchema(sitesTable);
const _Insert = createInsertSchema(sitesTable);

export const SitesContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(sitesTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type SitesDTO = {
  Response: typeof SitesContract.Response.static;
  Create: typeof SitesContract.Create.static;
  Update: typeof SitesContract.Update.static;
  Patch: typeof SitesContract.Patch.static;
  ListQuery: typeof SitesContract.ListQuery.static;
};
