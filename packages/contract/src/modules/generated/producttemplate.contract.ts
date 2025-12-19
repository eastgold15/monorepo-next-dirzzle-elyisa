import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { productTemplateTable } from "../../table.schema";
import { PaginationParams, SortParams } from "~/helper/query-types.t.model";

const _Select = createSelectSchema(productTemplateTable);
const _Insert = createInsertSchema(productTemplateTable);

export const ProductTemplateContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(productTemplateTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type ProductTemplateDTO = {
  Response: typeof ProductTemplateContract.Response.static;
  Create: typeof ProductTemplateContract.Create.static;
  Update: typeof ProductTemplateContract.Update.static;
  Patch: typeof ProductTemplateContract.Patch.static;
  ListQuery: typeof ProductTemplateContract.ListQuery.static;
};
