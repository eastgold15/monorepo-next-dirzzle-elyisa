import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { productsTable } from "../../table.schema";
import { PaginationParams, SortParams } from "../../helper/query-types.t.model";

const _Select = createSelectSchema(productsTable);
const _Insert = createInsertSchema(productsTable);

export const ProductsContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(productsTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type ProductsDTO = {
  Response: typeof ProductsContract.Response.static;
  Create: typeof ProductsContract.Create.static;
  Update: typeof ProductsContract.Update.static;
  Patch: typeof ProductsContract.Patch.static;
  ListQuery: typeof ProductsContract.ListQuery.static;
};
