import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { quotationsTable } from "../../table.schema";
import { PaginationParams, SortParams } from "~/helper/query-types.t.model";

const _Select = createSelectSchema(quotationsTable);
const _Insert = createInsertSchema(quotationsTable);

export const QuotationsContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(quotationsTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type QuotationsDTO = {
  Response: typeof QuotationsContract.Response.static;
  Create: typeof QuotationsContract.Create.static;
  Update: typeof QuotationsContract.Update.static;
  Patch: typeof QuotationsContract.Patch.static;
  ListQuery: typeof QuotationsContract.ListQuery.static;
};
