import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { productMasterCategoriesTable } from "../../table.schema";
import { PaginationParams, SortParams } from "~/helper/query-types.t.model";

const _Select = createSelectSchema(productMasterCategoriesTable);
const _Insert = createInsertSchema(productMasterCategoriesTable);

export const ProductMasterCategoriesContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(productMasterCategoriesTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type ProductMasterCategoriesDTO = {
  Response: typeof ProductMasterCategoriesContract.Response.static;
  Create: typeof ProductMasterCategoriesContract.Create.static;
  Update: typeof ProductMasterCategoriesContract.Update.static;
  Patch: typeof ProductMasterCategoriesContract.Patch.static;
  ListQuery: typeof ProductMasterCategoriesContract.ListQuery.static;
};
