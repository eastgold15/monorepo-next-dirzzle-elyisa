import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { quotationItemsTable } from "~/table.schema";
import { PaginationParams, SortParams } from "~/helper/query-types.model";

const _Select = createSelectSchema(quotationItemsTable);
const _Insert = createInsertSchema(quotationItemsTable);

export const QuotationItemsContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(quotationItemsTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type QuotationItemsDTO = {
  Response: typeof QuotationItemsContract.Response.static;
  Create: typeof QuotationItemsContract.Create.static;
  Update: typeof QuotationItemsContract.Update.static;
  Patch: typeof QuotationItemsContract.Patch.static;
  ListQuery: typeof QuotationItemsContract.ListQuery.static;
};
