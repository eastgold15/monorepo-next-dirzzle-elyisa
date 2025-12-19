import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { rolePermissionsTable } from "../../table.schema";
import { PaginationParams, SortParams } from "../../helper/query-types.model";

const _Select = createSelectSchema(rolePermissionsTable);
const _Insert = createInsertSchema(rolePermissionsTable);

export const RolePermissionsContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(rolePermissionsTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type RolePermissionsDTO = {
  Response: typeof RolePermissionsContract.Response.static;
  Create: typeof RolePermissionsContract.Create.static;
  Update: typeof RolePermissionsContract.Update.static;
  Patch: typeof RolePermissionsContract.Patch.static;
  ListQuery: typeof RolePermissionsContract.ListQuery.static;
};
