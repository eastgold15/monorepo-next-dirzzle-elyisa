import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { PaginationParams, SortParams } from "../../helper/query-types.model";
import { masterTable } from "../../table.schema";

const _Select = createSelectSchema(masterTable);
const _Insert = createInsertSchema(masterTable);

export const MasterContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(masterTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type MasterDTO = {
  Response: typeof MasterContract.Response.static;
  Create: typeof MasterContract.Create.static;
  Update: typeof MasterContract.Update.static;
  Patch: typeof MasterContract.Patch.static;
  ListQuery: typeof MasterContract.ListQuery.static;
};
