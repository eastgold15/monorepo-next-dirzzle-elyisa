import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { productMediaTable } from "~/table.schema";
import { PaginationParams, SortParams } from "~/helper/query-types.model";

const _Select = createSelectSchema(productMediaTable);
const _Insert = createInsertSchema(productMediaTable);

export const ProductMediaContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(productMediaTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type ProductMediaDTO = {
  Response: typeof ProductMediaContract.Response.static;
  Create: typeof ProductMediaContract.Create.static;
  Update: typeof ProductMediaContract.Update.static;
  Patch: typeof ProductMediaContract.Patch.static;
  ListQuery: typeof ProductMediaContract.ListQuery.static;
};
