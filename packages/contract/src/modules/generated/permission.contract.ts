import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { permissionTable } from "../../table.schema";
import { PaginationParams, SortParams } from "../../helper/query-types.t.model";

const _Select = createSelectSchema(permissionTable);
const _Insert = createInsertSchema(permissionTable);

export const PermissionContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(permissionTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type PermissionDTO = {
  Response: typeof PermissionContract.Response.static;
  Create: typeof PermissionContract.Create.static;
  Update: typeof PermissionContract.Update.static;
  Patch: typeof PermissionContract.Patch.static;
  ListQuery: typeof PermissionContract.ListQuery.static;
};
