import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { siteCategoriesTable } from "~/table.schema";
import { PaginationParams, SortParams } from "~/helper/query-types.model";

const _Select = createSelectSchema(siteCategoriesTable);
const _Insert = createInsertSchema(siteCategoriesTable);

export const SiteCategoriesContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(siteCategoriesTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type SiteCategoriesDTO = {
  Response: typeof SiteCategoriesContract.Response.static;
  Create: typeof SiteCategoriesContract.Create.static;
  Update: typeof SiteCategoriesContract.Update.static;
  Patch: typeof SiteCategoriesContract.Patch.static;
  ListQuery: typeof SiteCategoriesContract.ListQuery.static;
};
