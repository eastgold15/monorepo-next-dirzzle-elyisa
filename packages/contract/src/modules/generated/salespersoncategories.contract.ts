import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { salespersonCategoriesTable } from "../../table.schema";
import { PaginationParams, SortParams } from "~/helper/query-types.t.model";

const _Select = createSelectSchema(salespersonCategoriesTable);
const _Insert = createInsertSchema(salespersonCategoriesTable);

export const SalespersonCategoriesContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(salespersonCategoriesTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type SalespersonCategoriesDTO = {
  Response: typeof SalespersonCategoriesContract.Response.static;
  Create: typeof SalespersonCategoriesContract.Create.static;
  Update: typeof SalespersonCategoriesContract.Update.static;
  Patch: typeof SalespersonCategoriesContract.Patch.static;
  ListQuery: typeof SalespersonCategoriesContract.ListQuery.static;
};
