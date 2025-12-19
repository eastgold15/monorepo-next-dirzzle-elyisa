import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { CustomerTable } from "~/table.schema";
import { PaginationParams, SortParams } from "~/helper/query-types.model";

const _Select = createSelectSchema(CustomerTable);
const _Insert = createInsertSchema(CustomerTable);

export const CustomerContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(CustomerTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type CustomerDTO = {
  Response: typeof CustomerContract.Response.static;
  Create: typeof CustomerContract.Create.static;
  Update: typeof CustomerContract.Update.static;
  Patch: typeof CustomerContract.Patch.static;
  ListQuery: typeof CustomerContract.ListQuery.static;
};
