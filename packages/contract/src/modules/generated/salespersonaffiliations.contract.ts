import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { salespersonAffiliationsTable } from "~/table.schema";
import { PaginationParams, SortParams } from "~/helper/query-types.model";

const _Select = createSelectSchema(salespersonAffiliationsTable);
const _Insert = createInsertSchema(salespersonAffiliationsTable);

export const SalespersonAffiliationsContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(salespersonAffiliationsTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type SalespersonAffiliationsDTO = {
  Response: typeof SalespersonAffiliationsContract.Response.static;
  Create: typeof SalespersonAffiliationsContract.Create.static;
  Update: typeof SalespersonAffiliationsContract.Update.static;
  Patch: typeof SalespersonAffiliationsContract.Patch.static;
  ListQuery: typeof SalespersonAffiliationsContract.ListQuery.static;
};
