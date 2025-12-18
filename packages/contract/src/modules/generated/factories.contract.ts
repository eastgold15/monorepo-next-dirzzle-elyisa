import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { factoriesTable } from "../../table.schema";
import { PaginationParams, SortParams } from "../../helper/query-types.t.model";

const _Select = createSelectSchema(factoriesTable);
const _Insert = createInsertSchema(factoriesTable);

export const FactoriesContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(factoriesTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type FactoriesDTO = {
  Response: typeof FactoriesContract.Response.static;
  Create: typeof FactoriesContract.Create.static;
  Update: typeof FactoriesContract.Update.static;
  Patch: typeof FactoriesContract.Patch.static;
  ListQuery: typeof FactoriesContract.ListQuery.static;
};
