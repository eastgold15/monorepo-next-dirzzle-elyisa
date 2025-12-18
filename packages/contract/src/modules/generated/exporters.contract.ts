import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { exportersTable } from "../../table.schema";
import { PaginationParams, SortParams } from "../../helper/query-types.t.model";

const _Select = createSelectSchema(exportersTable);
const _Insert = createInsertSchema(exportersTable);

export const ExportersContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(exportersTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type ExportersDTO = {
  Response: typeof ExportersContract.Response.static;
  Create: typeof ExportersContract.Create.static;
  Update: typeof ExportersContract.Update.static;
  Patch: typeof ExportersContract.Patch.static;
  ListQuery: typeof ExportersContract.ListQuery.static;
};
