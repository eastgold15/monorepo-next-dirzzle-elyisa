import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { skuMediaTable } from "../../table.schema";
import { PaginationParams, SortParams } from "../../helper/query-types.t.model";

const _Select = createSelectSchema(skuMediaTable);
const _Insert = createInsertSchema(skuMediaTable);

export const SkuMediaContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(skuMediaTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type SkuMediaDTO = {
  Response: typeof SkuMediaContract.Response.static;
  Create: typeof SkuMediaContract.Create.static;
  Update: typeof SkuMediaContract.Update.static;
  Patch: typeof SkuMediaContract.Patch.static;
  ListQuery: typeof SkuMediaContract.ListQuery.static;
};
