import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { salespersonsTable } from "../../table.schema";
import { PaginationParams, SortParams } from "~/helper/query-types.t.model";

const _Select = createSelectSchema(salespersonsTable);
const _Insert = createInsertSchema(salespersonsTable);

export const SalespersonsContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(salespersonsTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type SalespersonsDTO = {
  Response: typeof SalespersonsContract.Response.static;
  Create: typeof SalespersonsContract.Create.static;
  Update: typeof SalespersonsContract.Update.static;
  Patch: typeof SalespersonsContract.Patch.static;
  ListQuery: typeof SalespersonsContract.ListQuery.static;
};
